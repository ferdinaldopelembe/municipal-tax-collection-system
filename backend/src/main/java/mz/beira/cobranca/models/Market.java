package mz.beira.cobranca.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "markets")
public class Market {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String location;
    private String manager;
    private boolean active = true;

    protected Market() {}

    public Market(String name) {
        this.name = name;
    }

    public Market(String name, String location, String manager, boolean active) {
        this.name = name;
        this.location = location;
        this.manager = manager;
        this.active = active;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getLocation() { return location; }
    public String getManager() { return manager; }
    public boolean isActive() { return active; }

    public void update(String name, String location, String manager, boolean active) {
        this.name = name;
        this.location = location;
        this.manager = manager;
        this.active = active;
    }
}
