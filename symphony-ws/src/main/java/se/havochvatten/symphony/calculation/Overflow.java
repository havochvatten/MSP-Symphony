package se.havochvatten.symphony.calculation;
import se.havochvatten.symphony.dto.LayerType;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class Overflow {
    public Overflow() {}

    public void setBandOverflow(Map<LayerType, HashSet<Integer>> bandOverflow) {
        this.bandOverflow = bandOverflow;
    }

    public Map<LayerType, HashSet<Integer>> bandOverflow;

    public void register(LayerType layerType, int bandNumber) {
        // Minimalistic initial approach - simply keep track
        // of which bands 'overflow'.

        if (bandOverflow == null) {
            bandOverflow = Map.of(layerType, new HashSet<>(Set.of(bandNumber)));
        } else {
            if (bandOverflow.containsKey(layerType)) {
                bandOverflow.get(layerType).add(bandNumber);
            } else {
                bandOverflow.put(layerType, new HashSet<>(Set.of(bandNumber)));
            }
        }
    }
}
