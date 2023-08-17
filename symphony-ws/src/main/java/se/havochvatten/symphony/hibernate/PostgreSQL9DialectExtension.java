package se.havochvatten.symphony.hibernate;

import com.vladmihalcea.hibernate.type.array.DoubleArrayType;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import org.hibernate.dialect.PostgreSQL9Dialect;

import java.sql.Types;

public class PostgreSQL9DialectExtension extends PostgreSQL9Dialect {

    public PostgreSQL9DialectExtension() {
        super();
        this.registerHibernateType(Types.ARRAY, DoubleArrayType.class.getName());
        this.registerHibernateType(Types.ARRAY, IntArrayType.class.getName());
        this.registerColumnType(Types.ARRAY, "integer[$l]");
        this.registerColumnType(Types.ARRAY, "double[$l]");
    }
}
