package com.example.splitwise.repository;

import com.example.splitwise.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByDescriptionContainingIgnoreCase(String q);
    List<Expense> findByPaidByIgnoreCase(String paidBy);
}

