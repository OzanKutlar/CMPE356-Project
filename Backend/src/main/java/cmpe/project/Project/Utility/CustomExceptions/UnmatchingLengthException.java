package cmpe.project.Project.Utility.CustomExceptions;

public class UnmatchingLengthException extends RuntimeException {

    private final int firstArrayLength;
    private final int secondArrayLength;

    public UnmatchingLengthException(int firstArrayLength, int secondArrayLength) {
        super("Array lengths do not match!"); 
        this.firstArrayLength = firstArrayLength;
        this.secondArrayLength = secondArrayLength;
    }

    public int getFirstArrayLength() {
        return firstArrayLength;
    }

    public int getSecondArrayLength() {
        return secondArrayLength;
    }

    @Override
    public String toString() {
        return super.toString() + " (First Array Length: " + firstArrayLength 
               + ", Second Array Length: " + secondArrayLength + ")";
    }
}
