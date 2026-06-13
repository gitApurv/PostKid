package com.apurv.config;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@EnableCaching
public class RedisConfig {

        @Bean
        @Primary
        public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
                RedisTemplate<String, Object> template = new RedisTemplate<>();
                template.setConnectionFactory(connectionFactory);

                StringRedisSerializer stringSerializer = new StringRedisSerializer();
                GenericJacksonJsonRedisSerializer jacksonSerializer = GenericJacksonJsonRedisSerializer.builder()
                                .build();

                template.setKeySerializer(stringSerializer);
                template.setValueSerializer(jacksonSerializer);
                template.setHashKeySerializer(stringSerializer);
                template.setHashValueSerializer(jacksonSerializer);

                template.afterPropertiesSet();
                return template;
        }

        @Bean
        public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
                RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                                .serializeKeysWith(
                                                RedisSerializationContext.SerializationPair
                                                                .fromSerializer(new StringRedisSerializer()))
                                .serializeValuesWith(RedisSerializationContext.SerializationPair
                                                .fromSerializer(GenericJacksonJsonRedisSerializer.builder().build()))
                                .disableCachingNullValues();

                Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
                cacheConfigurations.put("collection", defaultConfig.entryTtl(Duration.ofSeconds(300)));
                cacheConfigurations.put("collections", defaultConfig.entryTtl(Duration.ofSeconds(120)));
                cacheConfigurations.put("environment", defaultConfig.entryTtl(Duration.ofSeconds(300)));
                cacheConfigurations.put("environments", defaultConfig.entryTtl(Duration.ofSeconds(120)));

                return RedisCacheManager.builder(connectionFactory)
                                .cacheDefaults(defaultConfig)
                                .withInitialCacheConfigurations(cacheConfigurations)
                                .build();
        }
}
