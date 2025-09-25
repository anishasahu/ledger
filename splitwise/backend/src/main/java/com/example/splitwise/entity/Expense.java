package com.example.splitwise.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    private String paidBy; // simple string for demo ("Alice", "Bob")

    private String participants; // comma-separated names "Alice,Bob,Charlie"

    private LocalDate date;

    private boolean settled = false;

    // Constructors
    public Expense() {}

    public Expense(String description, BigDecimal amount, String paidBy, String participants, LocalDate date, boolean settled) {
        this.description = description;
        this.amount = amount;
        this.paidBy = paidBy;
        this.participants = participants;
        this.date = date;
        this.settled = false;
    }

    // Getters / Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaidBy() { return paidBy; }
    public void setPaidBy(String paidBy) { this.paidBy = paidBy; }

    public String getParticipants() { return participants; }
    public void setParticipants(String participants) { this.participants = participants; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public boolean isSettled() {return settled;}
    public void setSettled(boolean settled) {this.settled = settled;}
    
}
