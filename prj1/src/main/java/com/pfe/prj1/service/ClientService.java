package com.pfe.prj1.service;

import com.pfe.prj1.model.Article;
import com.pfe.prj1.model.Client;
import com.pfe.prj1.model.Account;

import com.pfe.prj1.repository.ClientRepository;
import com.pfe.prj1.repository.AccountRepository;
import com.pfe.prj1.repository.FactureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClientService {
    private final ClientRepository clientRepository;
    private final AccountRepository accountRepository;
    private final FactureRepository factureRepository;

    @Autowired
    public ClientService(ClientRepository clientRepository, AccountRepository accountRepository, FactureRepository factureRepository) {

        this.clientRepository = clientRepository;
        this.accountRepository = accountRepository;
        this.factureRepository = factureRepository;
    }

    // Récupérer tous les clients d'un compte spécifique
    public List<Client> getAllClientsByCompteId(int compteId) {
        return clientRepository.findAllByAccountId(compteId);
    }

    public Client getClientByIdAndAccount(int id, int accountId) {
        return clientRepository.findByIdAndAccountId(id, accountId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
    }

    public Client getClientById(int ClientId) {
        return clientRepository.findById(ClientId)
                .orElseThrow(() -> new RuntimeException("Client avec l'ID " + ClientId + " non trouvé"));
    }

    public void saveClient(Client client, int accountId) {
        // Vérifier si le compte existe
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Compte non trouvé"));

        // Vérifier si un client avec cet identifiant existe déjà dans ce compte
        Optional<Client> existingClient = clientRepository.findByIdentifiantAndAccountId(
                client.getIdentifiant(),
                accountId
        );
        if (existingClient.isPresent()) {
            throw new RuntimeException("Un client avec cet identifiant " + client.getIdentifiant() +
                    " existe déjà dans ce compte");
        }

        // Vérifier si un client avec cet email existe déjà dans ce compte
        Optional<Client> clientWithSameEmail = clientRepository.findByEmailAndAccountId(client.getEmail(), accountId);

        if (clientWithSameEmail.isPresent()) {
            throw new RuntimeException("Un client avec cet email " + client.getEmail() +
                    " existe déjà dans ce compte");
        }

        // Associer le client au compte
        client.setAccount(account);

        // Sauvegarder le client
        clientRepository.save(client);
    }

    // Mettre à jour un client tout en vérifiant qu'il appartient au bon compte
    @Transactional
    public Client updateClient(int clientId, Client client, int accountId) {
        // Vérifier si le client existe et appartient au bon compte
        Client existingClient = clientRepository.findByIdAndAccountId(clientId, accountId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        // Mettre à jour les champs
        existingClient.setNom(client.getNom());
        existingClient.setIdentifiant(client.getIdentifiant());
        existingClient.setTel(client.getTel());
        existingClient.setFax(client.getFax());
        existingClient.setEmail(client.getEmail());
        existingClient.setPays(client.getPays());
        existingClient.setAdresse(client.getAdresse());
        existingClient.setCodePostal(client.getCodePostal());

        return clientRepository.save(existingClient);
    }

    // Supprimer un client en vérifiant qu'il appartient au bon compte
    @Transactional
    public void deleteClient(int clientId, int accountId) {
        Client client = clientRepository.findByIdAndAccountId(clientId,accountId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        // Vérifier si l'article est utilisé dans des factures
        boolean isUsedInFactures = factureRepository.existsByClientId(clientId);

        if (isUsedInFactures) {
            throw new RuntimeException(
                    "Impossible de supprimer le client car il est utilisé dans une ou plusieurs factures");
        }

        clientRepository.delete(client);
    }
}
