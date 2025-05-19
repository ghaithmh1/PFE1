package com.pfe.prj1.controller;

import com.pfe.prj1.dto.ApiResponse;
import com.pfe.prj1.dto.ArticleDTO;
import com.pfe.prj1.model.Article;
import com.pfe.prj1.service.ArticleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/articles")
public class ArticleController {
    @Autowired
    private ArticleService articleService;

    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> getByAccount(@PathVariable int accountId) {
        return ResponseEntity.ok(articleService.getArticlesByAccount(accountId));
    }

    @GetMapping("/{ArticleId}")
    public ResponseEntity<ApiResponse> getArticleById(@PathVariable("ArticleId") int ArticleId) {
        try {
            Article article = articleService.getArticleById(ArticleId);
            return ResponseEntity.ok(new ApiResponse("Article récupéré avec succès", article));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage()));
        }
    }


    @PostMapping
    public ResponseEntity<ApiResponse> createArticle(@Valid @RequestBody ArticleDTO articleDTO) {
        try {
            // Convertir la TVA de String à l'énumération TVA
            Article.TVA tva;
            try {
                tva = Article.TVA.valueOf(articleDTO.getTVA());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse("Valeur TVA invalide. Valeurs acceptées: TVA_19, TVA_13, TVA_7, TVA_0"));
            }

            // Créer un nouvel article à partir du DTO
            Article article = new Article();
            article.setDesignation(articleDTO.getDesignation());
            article.setReference(articleDTO.getReference());
            article.setDescription(articleDTO.getDescription());
            article.setTVA(tva); // TVA convertie en enum
            article.setPrixVente(articleDTO.getPrixVente());
            article.setPrixAchat(articleDTO.getPrixAchat());
            article.setNote(articleDTO.getNote());

            // Sauvegarder l'article
            articleService.saveArticle(article, articleDTO.getAccountId());
            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse("Article créé avec succès", article));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage()));
        }
    }

    @PutMapping("/{ArticleId}/account/{accountId}")
    public ResponseEntity<ApiResponse> updateArticle(@PathVariable("ArticleId") int ArticleId, @PathVariable("accountId") int AccountId ,@Valid @RequestBody Article articleUpdate) {
        try {
            articleService.updateArticle(ArticleId ,articleUpdate, AccountId);
            return ResponseEntity.ok(new ApiResponse("Article mis à jour avec succès", articleUpdate));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{ArticleId}/account/{accountId}")
    public ResponseEntity<ApiResponse> deleteArticle(@PathVariable("ArticleId") int ArticleId, @PathVariable("accountId") int AccountId) {
        try {
            articleService.deleteArticle(ArticleId, AccountId);
            return ResponseEntity.ok(new ApiResponse("Article avec l'ID " + ArticleId + " a été supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage()));
        }
    }
}
