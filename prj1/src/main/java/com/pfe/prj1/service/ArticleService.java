package com.pfe.prj1.service;

import com.pfe.prj1.model.Account;
import com.pfe.prj1.model.Article;
import com.pfe.prj1.repository.AccountRepository;
import com.pfe.prj1.repository.ArticleRepository;
import com.pfe.prj1.repository.FactureLigneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ArticleService {
    private final ArticleRepository articleRepository;
    private final AccountRepository accountRepository;
    private final FactureLigneRepository factureLigneRepository;

    @Autowired
    public ArticleService(ArticleRepository articleRepository,
                          AccountRepository accountRepository,
                          FactureLigneRepository factureLigneRepository) {
        this.articleRepository = articleRepository;
        this.accountRepository = accountRepository;
        this.factureLigneRepository=factureLigneRepository;
    }


    public List<Article> getArticlesByAccount(int accountId) {
        return articleRepository.findByAccountId(accountId);
    }

    public Article getArticleByIdAndAccount(int id, int accountId) {
        return articleRepository.findByIdAndAccountId(id, accountId)
                .orElseThrow(() -> new RuntimeException("Article non trouvé"));
    }

    public List<Article> getAllArticles(){
        return articleRepository.findAll();
    }

    public Article getArticleById(int ArticleId) {
        return articleRepository.findById(ArticleId)
                .orElseThrow(() -> new RuntimeException("Article avec l'ID " + ArticleId + " non trouvé"));
    }

    @Transactional
    public void saveArticle(Article article, int accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Compte non trouvé"));

        if (article.getPrixVente() <= 0 || article.getPrixAchat() <= 0) {
            throw new RuntimeException("Les prix de vente et d'achat doivent être positifs");
        }
        Optional<Article> existingArticle = articleRepository.findArticleByReference(article.getReference());
        if (existingArticle.isPresent()) {
            throw new RuntimeException("Un article avec cette référence existe déjà");
        }

        article.setAccount(account);
        articleRepository.save(article);
    }

    @Transactional
    public Article updateArticle(int ArticleId, Article articleUpdate, int accountId) {
        Article existingArticle = articleRepository.findByIdAndAccountId(ArticleId, accountId)
                .orElseThrow(() -> new RuntimeException("Article non trouvé"));

        // Mettre à jour les champs de l'article existant avec les nouvelles valeurs
        existingArticle.setDesignation(articleUpdate.getDesignation());
        existingArticle.setReference(articleUpdate.getReference());
        existingArticle.setDescription(articleUpdate.getDescription());
        existingArticle.setTVA(articleUpdate.getTVA());
        existingArticle.setPrixVente(articleUpdate.getPrixVente());
        existingArticle.setPrixAchat(articleUpdate.getPrixAchat());
        existingArticle.setNote(articleUpdate.getNote());

        // Sauvegarder l'article mis à jour
        return articleRepository.save(existingArticle);
    }

    @Transactional
    public void deleteArticle(int id, int accountId) {
        Article article = articleRepository.findByIdAndAccountId(id, accountId)
                .orElseThrow(() -> new RuntimeException("Article non trouvé"));
        // Vérifier si l'article est utilisé dans des factures
        boolean isUsedInFactures = factureLigneRepository.existsByArticleId(id);

        if (isUsedInFactures) {
            throw new RuntimeException(
                    "Impossible de supprimer l'article car il est utilisé dans une ou plusieurs factures");
        }
        articleRepository.delete(article);
    }

}