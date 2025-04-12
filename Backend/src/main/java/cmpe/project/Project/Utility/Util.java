package cmpe.project.Project.Utility;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import cmpe.project.Project.Utility.CustomExceptions.UnmatchingLengthException;

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

    public static Map<String, String> JsonResponder(String key, String status){
        Map<String, String> response = new HashMap<>();
        response.put(key, status);
        return response;
    }

    public static Map<Object, Object> JsonResponder(Object[] key, Object[] value){
        if(key.length != value.length)
            throw new UnmatchingLengthException(key.length, value.length);
        Map<Object, Object> response = new HashMap<>();
        for(int i = 0; i<key.length; i++){
            response.put(key[i], value[i]);
        }
        return response;

    }
}
