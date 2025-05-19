package com.pfe.prj1.repository;

import com.pfe.prj1.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Integer> {
    @Query("SELECT a FROM Article a WHERE a.reference = ?1")
    Optional<Article> findArticleByReference(String reference);

    List<Article> findByAccountId(int accountId);

    Optional<Article> findByIdAndAccountId(int id, int accountId);
}
