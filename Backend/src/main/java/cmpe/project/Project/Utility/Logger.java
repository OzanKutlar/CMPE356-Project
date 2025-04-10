package cmpe.project.Project.Utility;

public class Logger {

    public static String[] DEBUG = "Scene,Database".split(",");

    public static void log(String s, Object... objects) {
        logPrefixed("[" + Thread.currentThread().getName() + "] : ", s, objects);
    }

    private static void logPrefixed(String prefix, String s, Object... objects) {
        for (Object object : objects) {
            s = s.replaceFirst("%s", object.toString());
        }
        System.out.println(prefix + s);
    }

    public static String format(String s, Object... objects){
        for (Object object : objects) {
            s = s.replaceFirst("%s", object.toString());
        }
        return s;
    }

    public static void debugLog(String debugType, String s, Object... objects) {
        boolean shouldPrint = DEBUG[0].equalsIgnoreCase("all");
        if (!shouldPrint) {
            for (String a : DEBUG) {
                if (debugType.contains(a)) {
                    shouldPrint = true;
                    break;
                }
            }
        }

        if (shouldPrint) {
            logPrefixed("[DEBUG] - [" + debugType + "] : ", s, objects);
        }
    }

    public static void logError(String s, Object... objects) {
        logPrefixed("[ERROR] : ", s, objects);
    }
}
