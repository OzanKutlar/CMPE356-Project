package cmpe.project.Project.DatabaseHandler;

import javax.sql.rowset.CachedRowSet;
import javax.sql.rowset.RowSetProvider;
import java.sql.*;
import static cmpe.project.Project.Utility.Logger.*;

public class DatabaseHandler {

    static final String DATABASE_URL = "jdbc:mariadb://171.22.173.112:3306/cmpe356";
    static final String USER = "dbAgent";
    static final String PASSWORD = "12345";

    public static DatabaseHandler INSTANCE;
    private Connection connection;

    public static void createInstance() {
        if (INSTANCE == null) {
            DatabaseHandler.INSTANCE = new DatabaseHandler();
        }
    }

    private DatabaseHandler() {
        try {
            connect();
        } catch (SQLException e) {
            logError("Failed to initialize database connection: " + e.getMessage());
        }
    }

    private synchronized void connect() throws SQLException {
        if (connection == null || connection.isClosed()) {
            connection = DriverManager.getConnection(DATABASE_URL, USER, PASSWORD);
        }
    }

    public ResultSet sendRequest(String requestString, Object[] params) throws SQLException {
        try {
            connect();
            try (PreparedStatement stmt = connection.prepareStatement(requestString)) {
                if (params != null) {
                    for (int i = 0; i < params.length; i++) {
                        stmt.setObject(i + 1, params[i]);
                    }
                }
                System.out.println(stmt + "\n \n");
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
            }
        } catch (SQLException e) {
            logError("Database error: " + e.getMessage());
            try {
                connect();
                // Retry the operation
                try (PreparedStatement stmt = connection.prepareStatement(requestString)) {
                    if (params != null) {
                        for (int i = 0; i < params.length; i++) {
                            stmt.setObject(i + 1, params[i]);
                        }
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
                }
            } catch (SQLException ex) {
                throw ex;
            }
        }
    }

    public int executeQuery(String requestString, Object[] params) throws SQLException {
        int rowsUpdated;
        try {
            connect();
            try (PreparedStatement stmt = connection.prepareStatement(requestString)) {
                for (int i = 0; i < params.length; i++) {
                    stmt.setObject(i + 1, params[i]);
                }
                rowsUpdated = stmt.executeUpdate();
            }
        } catch (SQLException e) {
            logError("Database error: " + e.getMessage());
            try {
                connect();
                // Retry the operation
                try (PreparedStatement stmt = connection.prepareStatement(requestString)) {
                    for (int i = 0; i < params.length; i++) {
                        stmt.setObject(i + 1, params[i]);
                    }
                    rowsUpdated = stmt.executeUpdate();
                }
            } catch (SQLException ex) {
                throw ex;
            }
        }
        return rowsUpdated;
    }

    public static boolean checkDatabaseExists() {
        try {
            Connection connection = DriverManager.getConnection(DATABASE_URL, USER, PASSWORD);
            connection.close();
        } catch (SQLException e) {
            return false;
        }
        return true;
    }
}