package com.example.splitwise.controller;

import com.example.splitwise.entity.Expense;
import com.example.splitwise.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:5173") // allow Vite dev server
public class ExpenseController {
    private final ExpenseService service;

    public ExpenseController(ExpenseService service) { this.service = service; }

    @GetMapping
    public List<Expense> all(@RequestParam(required = false) String q) {
        return service.search(q);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> get(@PathVariable Long id) {
        Optional<Expense> es = service.findById(id);
        return es.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Expense> create(@RequestBody Expense expense) {
        Expense saved = service.save(expense);
        return ResponseEntity.created(URI.create("/api/expenses/" + saved.getId())).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Optional<Expense> ex = service.findById(id);
        if (ex.isEmpty()) return ResponseEntity.notFound().build();
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(@PathVariable Long id, @RequestBody Expense updated) {
        return service.findById(id)
            .map(existing -> {
                existing.setDescription(updated.getDescription());
                existing.setAmount(updated.getAmount());
                existing.setPaidBy(updated.getPaidBy());
                existing.setParticipants(updated.getParticipants());
                existing.setDate(updated.getDate());
                existing.setSettled(updated.isSettled());
                Expense saved = service.save(existing);
                return ResponseEntity.ok(saved);
            }).orElseGet(() -> ResponseEntity.notFound().build());
    }

}
