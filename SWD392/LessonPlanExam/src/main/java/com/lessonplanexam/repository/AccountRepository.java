package com.lessonplanexam.repository;

import com.lessonplanexam.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {

    Optional<Account> findByEmail(String email);

    Optional<Account> findByNormalizedEmail(String normalizedEmail);

    boolean existsByEmail(String email);

    boolean existsByNormalizedEmail(String normalizedEmail);
}
