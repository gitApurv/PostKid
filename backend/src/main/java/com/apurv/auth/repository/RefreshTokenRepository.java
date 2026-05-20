package com.apurv.auth.repository;

import com.apurv.auth.entity.RefreshToken;
import com.apurv.auth.entity.User;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    void deleteByUser(User user);

    Optional<RefreshToken> findByToken(String token);
}
