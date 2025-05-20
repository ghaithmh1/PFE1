package com.pfe.prj1.controller;

import com.pfe.prj1.dto.ApiResponse;
import com.pfe.prj1.dto.ClientDTO;
import com.pfe.prj1.model.Client;
import com.pfe.prj1.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clients")
public class ClientController {
    @Autowired
    private ClientService clientService;

    @GetMapping("/account/{accountId}")
    public ResponseEntity<ApiResponse> getByAccount(@PathVariable int accountId) {
        List<Client> clients = clientService.getAllClientsByCompteId(accountId);
        return ResponseEntity.ok(new ApiResponse("Clients récupérés avec succès", clients));
    }

    @GetMapping("/{clientId}")
    public ResponseEntity<ApiResponse> getClientById(@PathVariable("clientId") int clientId) {
        try {
            Client client = clientService.getClientById(clientId);
            return ResponseEntity.ok(new ApiResponse("Client récupéré avec succès", client));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createClient(@Valid @RequestBody ClientDTO clientDTO) {
        try {
            Client client = convertDtoToEntity(clientDTO);
            clientService.saveClient(client, clientDTO.getAccountId());
            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse("Client créé avec succès", client));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(e.getMessage()));
        }
    }

    @PutMapping("/{clientId}/account/{accountId}")
    public ResponseEntity<ApiResponse> updateClient(@PathVariable("clientId") int clientId,
                                                    @PathVariable("accountId") int accountId,
                                                    @Valid @RequestBody Client client) {
        try {
            Client updatedClient = clientService.updateClient(clientId, client, accountId);
            return ResponseEntity.ok(new ApiResponse("Client mis à jour avec succès", updatedClient));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{clientId}/account/{accountId}")
    public ResponseEntity<ApiResponse> deleteClient(@PathVariable("clientId") int clientId,
                                                    @PathVariable("accountId") int accountId) {
        try {
            clientService.deleteClient(clientId, accountId);
            return ResponseEntity.ok(new ApiResponse("Client supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage()));
        }
    }

    private Client convertDtoToEntity(ClientDTO clientDTO) {
        Client client = new Client();

        // Conversion des champs de base
        client.setNom(clientDTO.getNom());
        client.setIdentifiant(clientDTO.getIdentifiant());
        client.setTel(clientDTO.getTel());
        client.setFax(clientDTO.getFax());
        client.setEmail(clientDTO.getEmail());
        client.setPays(clientDTO.getPays());
        client.setAdresse(clientDTO.getAdresse());
        client.setCodePostal(clientDTO.getCodePostal());
        return client;
    }
}