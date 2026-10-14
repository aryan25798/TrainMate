package com.trainmate.repository;

import com.trainmate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.email = :identifier OR u.name = :identifier OR u.email LIKE CONCAT(:identifier, '@%') ORDER BY CASE WHEN u.email = :identifier THEN 1 WHEN u.name = :identifier THEN 2 ELSE 3 END ASC, u.id ASC")
    java.util.List<User> findByIdentifier(@Param("identifier") String identifier);

    java.util.List<User> findByRole(com.trainmate.entity.Role role);
}
