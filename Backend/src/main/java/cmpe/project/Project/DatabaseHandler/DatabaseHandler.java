package cmpe.project.Project.DatabaseHandler;

import javax.sql.rowset.CachedRowSet;
import javax.sql.rowset.RowSetProvider;
import java.sql.*;
import java.util.ArrayList;
import java.util.Objects;
import java.util.UUID;

import static cmpe.project.Project.Utility.Logger.*;
public class DatabaseHandler {


    static final String DATABASE_URL = "";


    public static Thread DBThread = null;

    public static DatabaseHandler instance;

    public ResultSet sendRequest(String requestString){
        return null;
    }

    public static boolean checkDatabaseExists(){
        try{
            /**
             * Checks whether a database exists or not. The connection gives out a SQLException when the database in the url
             * doesn't exist.
             */
            Connection connection = DriverManager.getConnection(DATABASE_URL, "dbAgent", "1234");
            connection.close();
        }
        catch(SQLException e){
            return false;
        }
        return true;
    }

}