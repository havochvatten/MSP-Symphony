package se.havochvatten.symphony.util;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Predicate;

public final class Util {
    private Util() {}

    /**
     * More general version of Stream.reduce allowing for different types in reducer function
     */
    public static <T, U> U reduce(List<T> changes, U identity, BiFunction<U, T, U> accumulator) {
        U result = identity;
        for (T element : changes)
            result = accumulator.apply(result, element);
        return result;
    }

    public static <T> Predicate<T> distinctByKey(Function<? super T, ?> keyExtractor) {
        Set<Object> seen = ConcurrentHashMap.newKeySet();
        return t -> seen.add(keyExtractor.apply(t));
    }
}
