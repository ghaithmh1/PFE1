package com.pfe.prj1.controller;

import com.pfe.prj1.dto.ApiResponse;
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

    @GetMapping
    public ResponseEntity<ApiResponse> getAllClients() {
        List<Client> clients = clientService.getAllClientsByEntreprise();
        return ResponseEntity.ok(new ApiResponse("Clients récupérés avec succès", clients));
    }

    @GetMapping("/{clientId}")
    public ResponseEntity<ApiResponse> getClientById(@PathVariable int clientId) {
        try {
            Client client = clientService.getClientById(clientId);
            return ResponseEntity.ok(new ApiResponse("Client récupéré avec succès", client));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createClient(@Valid @RequestBody Client client) {
        try {
            Client savedClient = clientService.saveClient(client);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse("Client créé avec succès", savedClient));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(e.getMessage()));
        }
    }

    @PutMapping("/{clientId}")
    public ResponseEntity<ApiResponse> updateClient(
            @PathVariable int clientId,
            @Valid @RequestBody Client client) {
        try {
            Client updatedClient = clientService.updateClient(clientId, client);
            return ResponseEntity.ok(new ApiResponse("Client mis à jour avec succès", updatedClient));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{clientId}")
    public ResponseEntity<ApiResponse> deleteClient(@PathVariable int clientId) {
        try {
            clientService.deleteClient(clientId);
            return ResponseEntity.ok(new ApiResponse("Client supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(e.getMessage()));
        }
    }
}