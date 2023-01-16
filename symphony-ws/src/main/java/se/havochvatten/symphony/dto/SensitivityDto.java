package se.havochvatten.symphony.dto;

import java.math.BigDecimal;
import java.util.Vector;

public class SensitivityDto {
    public static class SensCol {
        int sensId;
        int ecoMetaId;
        String name;
        String nameLocal;
        BigDecimal value;

        public int getSensId() { return sensId; }

        public void setSensId(int id) { this.sensId = id; }

        public int getEcoMetaId() {
            return ecoMetaId;
        }

        public void setEcoMetaId(int id) {
            this.ecoMetaId = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getNameLocal() {
            return nameLocal;
        }

        public void setNameLocal(String nameLocal) {
            this.nameLocal = nameLocal;
        }

        public BigDecimal getValue() {
            return value;
        }

        public void setValue(BigDecimal value) {
            this.value = value;
        }
    }

    public static class SensRow {
        int presMetaId;
        String name;
        String nameLocal;
        Vector<SensCol> columns;

        public int getPresMetaId() {
            return presMetaId;
        }

        public void setPresMetaId(int id) {
            this.presMetaId = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getNameLocal() {
            return nameLocal;
        }

        public void setNameLocal(String nameLocal) {
            this.nameLocal = nameLocal;
        }

        public Vector<SensCol> getColumns() {
            if (columns == null) {
                columns = new Vector<>();
            }
            return columns;
        }

        public void setColumns(Vector<SensCol> columns) {
            this.columns = columns;
        }
    }


    Vector<SensRow> rows;

    public Vector<SensRow> getRows() {
        if (rows == null) {
            rows = new Vector<>();
        }
        return rows;
    }

}
