package se.havochvatten.symphony.appconfig;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonFactoryBuilder;
import com.fasterxml.jackson.core.StreamReadConstraints;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.Dependent;
import jakarta.ws.rs.ext.ContextResolver;
import jakarta.ws.rs.ext.Provider;

@Provider
@Dependent
public class ObjectMapperConfiguration implements ContextResolver<ObjectMapper> {
    private final ObjectMapper mapper;

    private static final JsonFactory jf = new JsonFactoryBuilder()
        .streamReadConstraints(
            StreamReadConstraints
                .builder()
                .maxStringLength(Integer.MAX_VALUE)
                .build()
        )
        .build();

    public ObjectMapperConfiguration() {
        this.mapper = createObjectMapper();
    }

    @Override
    public ObjectMapper getContext(Class<?> type) {
        return mapper;
    }

    private ObjectMapper createObjectMapper() {
        return new ObjectMapper(jf);
    }
}
