package se.havochvatten.symphony.entity;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "sensitivity")
@XmlRootElement
@NamedQuery(name = "Sensitivity.findAll", query = "SELECT s FROM Sensitivity s")
@NamedQuery(name = "Sensitivity.findById", query = "SELECT s FROM Sensitivity s WHERE s.id = :is")
public class Sensitivity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sens_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "sens_pres_band_id", nullable = false)
    private SymphonyBand pressureBand;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "sens_eco_band_id", nullable = false)
    private SymphonyBand ecoBand;

    @NotNull
    @Column(name = "sens_value", nullable = false)
    private BigDecimal value;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "sens_sensm_id", nullable = false)
    private SensitivityMatrix matrix;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public SymphonyBand getPressureBand() {
        return pressureBand;
    }

    public void setPressureBand(SymphonyBand pressureBand) {
        this.pressureBand = pressureBand;
    }

    public SymphonyBand getEcoBand() {
        return ecoBand;
    }

    public void setEcoBand(SymphonyBand ecoBand) {
        this.ecoBand = ecoBand;
    }

    public SensitivityMatrix getMatrix() {
        return matrix;
    }

    public void setMatrix(SensitivityMatrix matrix) {
        this.matrix = matrix;
    }

}
