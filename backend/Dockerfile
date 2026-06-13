FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY .mvn ./.mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:25-jre
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
EXPOSE 8080

ENV SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/postKid
ENV DB_USERNAME=postgres
ENV DB_PASSWORD=postgres
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV MONGODB_URI=mongodb://mongodb:27017/postKid
ENV POSTKID_ALLOWED_URLS=http://localhost:5173

COPY --from=build /app/target/postKid-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]