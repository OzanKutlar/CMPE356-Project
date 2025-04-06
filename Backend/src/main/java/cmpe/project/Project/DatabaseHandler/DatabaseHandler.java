package cmpe.project.Project.DatabaseHandler;

import javax.sql.rowset.CachedRowSet;
import javax.sql.rowset.RowSetProvider;
import java.sql.*;
import java.util.ArrayList;
import java.util.Objects;
import java.util.UUID;

import static cmpe.project.Project.Utility.Logger.*;
public class DatabaseHandler {


    static final String DATABASE_URL = "jdbc:mysql://171.22.173.112:3306/ProjectDB";


    public static Thread DBThread = null;

    public static DatabaseHandler INSTANCE;

    public DatabaseHandler(){
        DatabaseHandler.INSTANCE = this;
    }

    public ResultSet sendRequest(String requestString, Object[] params) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DATABASE_URL, "root", "");
             PreparedStatement stmt = conn.prepareStatement(requestString)) {

            for (int i = 0; i < params.length; i++) {
                stmt.setObject(i + 1, params[i]);
            }

            boolean hasResults = stmt.execute();
            if (hasResults) {
                ResultSet rs = stmt.getResultSet();
                CachedRowSet cached = RowSetProvider.newFactory().createCachedRowSet();
                cached.populate(rs);
                rs.close();
                return cached;
            } else {
                return null;
            }
        } catch (SQLException e) {
            throw e;
        }
    }

    public void executeQuery(String requestString, Object[] params) throws SQLException{
        try (Connection conn = DriverManager.getConnection(DATABASE_URL, "root", "");
             PreparedStatement stmt = conn.prepareStatement(requestString)) {
            for (int i = 0; i < params.length; i++) {
                stmt.setObject(i + 1, params[i]);
            }
            stmt.execute();
        }
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