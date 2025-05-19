package com.pfe.prj1.service;

import com.pfe.prj1.model.*;
import com.pfe.prj1.repository.ClientRepository;
import com.pfe.prj1.repository.UtilisateurRepository;
import com.pfe.prj1.repository.FactureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClientService {
    private final ClientRepository clientRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final FactureRepository factureRepository;

    @Autowired
    public ClientService(ClientRepository clientRepository,
                        UtilisateurRepository utilisateurRepository,
                        FactureRepository factureRepository) {
        this.clientRepository = clientRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.factureRepository = factureRepository;
    }

    private Entreprise getCurrentEnterprise() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("Utilisateur non trouvé"));
        return user.getAccount().getEntreprise();
    }

    public List<Client> getAllClientsByEntreprise() {
        Entreprise entreprise = getCurrentEnterprise();
        return clientRepository.findAllByEntrepriseId(entreprise.getId());
    }

    public Client getClientById(int clientId) {
        Entreprise entreprise = getCurrentEnterprise();
        return clientRepository.findByIdAndEntrepriseId(clientId, entreprise.getId())
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
    }

    public Client saveClient(Client client) {
        Entreprise entreprise = getCurrentEnterprise();
        
        Optional<Client> existingClient = clientRepository
                .findByIdentifiantAndEntrepriseId(client.getIdentifiant(), entreprise.getId());
        if (existingClient.isPresent()) {
            throw new RuntimeException("Identifiant déjà utilisé dans cette entreprise");
        }
        
        Optional<Client> clientWithEmail = clientRepository
                .findByEmailAndEntrepriseId(client.getEmail(), entreprise.getId());
        if (clientWithEmail.isPresent()) {
            throw new RuntimeException("Email déjà utilisé dans cette entreprise");
        }

        client.setEntreprise(entreprise);
        return clientRepository.save(client);
    }

    public Client updateClient(int clientId, Client client) {
        Entreprise entreprise = getCurrentEnterprise();
        Client existingClient = clientRepository
                .findByIdAndEntrepriseId(clientId, entreprise.getId())
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

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

    public void deleteClient(int clientId) {
        Entreprise entreprise = getCurrentEnterprise();
        Client client = clientRepository
                .findByIdAndEntrepriseId(clientId, entreprise.getId())
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        if (factureRepository.existsByClientId(clientId)) {
            throw new RuntimeException("Client utilisé dans des factures");
        }

        clientRepository.delete(client);
    }
}