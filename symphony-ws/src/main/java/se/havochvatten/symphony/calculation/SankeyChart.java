package se.havochvatten.symphony.calculation;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

class Node {
    public int nodeId;
    public String name; // "bX" or "eY"

    Node(int id, String desc) {
        nodeId = id;
        name = desc;
    }
}

class Link {
    public int source;
    public int target;
    public double value; // TODO: Scale to percent?

    /**
     * @param src    source node id
     * @param target target node id
     * @param val    the value
     */
    Link(int src, int target, double val) {
        this.source = src;
        this.target = target;
        value = val;
    }
}

public class SankeyChart {
    static double SANKEY_LINK_WEIGHT_TOLERANCE = 0.001;

    private final Map<String, List> chartData;

    static int pressureNodeId(int b) {
        return b;
    }

    static int ecocomponentNodeId(int e, int pLen) {
        return pLen + e; // TODO do something more clever?
    }

    public SankeyChart(int[] ecosystemServices, int[] pressures, double[][] impactMatrix, double total)
    {
        int pLen = impactMatrix.length, esLen = impactMatrix[0].length;

        Stream<Node> ps = IntStream.range(0, pLen).mapToObj(b ->
                new Node(pressureNodeId(b), "b" + pressures[b]));
        Stream<Node> es = IntStream.range(0, esLen).mapToObj(e ->
                new Node(ecocomponentNodeId(e, pLen), "e" + ecosystemServices[e]));

        Stream<Stream<Link>> linksStream = IntStream.range(0, pLen).mapToObj(b ->
                IntStream.range(0, esLen).mapToObj(e ->
                        new Link(pressureNodeId(b), ecocomponentNodeId(e, pLen), impactMatrix[b][e] / total)));
        List<Link> links = linksStream.flatMap(Function.identity()).
                filter(link -> link.value > SANKEY_LINK_WEIGHT_TOLERANCE).
                collect(Collectors.toList());

        chartData = Map.of(
                "nodes", Stream.concat(ps, es).
                        // filter out nodes which are not referenced by any link
                                filter(node -> links.stream().anyMatch(link ->
                                link.source == node.nodeId || link.target == node.nodeId)).
                        collect(Collectors.toList()),
                "links", links);
    }

    public Map<String, List> getChartData() {
        return chartData;
    }
}
