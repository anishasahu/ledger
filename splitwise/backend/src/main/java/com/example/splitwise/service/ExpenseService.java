package com.example.splitwise.service;

import com.example.splitwise.entity.Expense;
import com.example.splitwise.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExpenseService {
    private final ExpenseRepository repo;

    public ExpenseService(ExpenseRepository repo) {
        this.repo = repo;
    }

    public List<Expense> findAll() { return repo.findAll(); }

    public Optional<Expense> findById(Long id) { return repo.findById(id); }

    public Expense save(Expense e) { return repo.save(e); }

    public void deleteById(Long id) { repo.deleteById(id); }

    public List<Expense> search(String q) {
        if (q == null || q.isBlank()) return repo.findAll();
        return repo.findByDescriptionContainingIgnoreCase(q);
    }
}
