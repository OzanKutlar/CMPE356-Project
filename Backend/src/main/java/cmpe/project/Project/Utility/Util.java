package cmpe.project.Project.Utility;

import java.util.Map;
import java.util.UUID;

public class Util {

    public static void logHeaders(String endpoint, Map<String, String> headers) {
        System.out.println("Request to " + endpoint + " with headers:");
        headers.forEach((key, value) -> System.out.println("  " + key + ": " + value));
    }

    public static UUID getUuidOrNull(String s){
        try{
            return UUID.fromString(s);
        }
        catch(Exception e){
            return null;
        }
    }


}
