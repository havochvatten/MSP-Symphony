package se.havochvatten.symphony.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;

@Entity
@Table(name = "userdefarea_category")
@XmlRootElement
@NamedQuery(name = "UserDefinedAreaCategory.findAll", query = "SELECT u FROM UserDefinedAreaCategory u")
@NamedQuery(name = "UserDefinedAreaCategory.findAllByOwner",
        query = "SELECT u FROM UserDefinedAreaCategory u WHERE u.owner = :owner")
public class UserDefinedAreaCategory implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "uda_cat_id", nullable = false)
    private Integer id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 2147483647)
    @Column(name = "uda_cat_name")
    private String name;

    @NotNull
    @Column(name = "uda_owner")
    private String owner;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }
}    
