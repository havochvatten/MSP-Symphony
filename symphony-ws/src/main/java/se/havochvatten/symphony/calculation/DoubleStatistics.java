package se.havochvatten.symphony.calculation;

import java.util.DoubleSummaryStatistics;

// From https://stackoverflow.com/a/36264148/8944259
public class DoubleStatistics extends DoubleSummaryStatistics {

    private double sumOfSquare = 0.0d;
    private double sumOfSquareCompensation; // Low order bits of sum
    private double simpleSumOfSquare; // Used to compute right sum for non-finite inputs

    private int[] simpleHistogram = new int[16777215];

    @Override
    public void accept(double value) {
        super.accept(value);
        double squareValue = value * value;
        simpleSumOfSquare += squareValue;
        sumOfSquareWithCompensation(squareValue);
        processMedian(value);
    }

    private void processMedian(double value) {
        int ivalue = (int) value & 0xFFFFFF;
        ++simpleHistogram[ivalue];
    }

    public double getMedian() {
        int midPoint = (int) Math.ceil(this.getCount() / 2);
        int acc = 0;
        int i = 0;

        for(int cur : simpleHistogram){
            acc += cur > 0 ? cur : 0;
            if(acc > midPoint) break;
            i++;
        }

        return i;
    }

    public DoubleStatistics combine(DoubleStatistics other) {
        super.combine(other);
        simpleSumOfSquare += other.simpleSumOfSquare;
        sumOfSquareWithCompensation(other.sumOfSquare);
        sumOfSquareWithCompensation(other.sumOfSquareCompensation);
        return this;
    }

    private void sumOfSquareWithCompensation(double value) {
        double tmp = value - sumOfSquareCompensation;
        double velvel = sumOfSquare + tmp; // Little wolf of rounding error
        sumOfSquareCompensation = (velvel - sumOfSquare) - tmp;
        sumOfSquare = velvel;
    }

    public double getSumOfSquare() {
        double tmp = sumOfSquare + sumOfSquareCompensation;
        if (Double.isNaN(tmp) && Double.isInfinite(simpleSumOfSquare)) {
            return simpleSumOfSquare;
        }
        return tmp;
    }

    public final double getStandardDeviation() {
        return getCount() > 0 ? Math.sqrt((getSumOfSquare() / getCount()) - Math.pow(getAverage(), 2)) : 0.0d;
    }
}
