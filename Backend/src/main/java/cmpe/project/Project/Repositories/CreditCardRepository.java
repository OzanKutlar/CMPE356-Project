package cmpe.project.Project.Repositories;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import cmpe.project.Project.DTOs.CreditCardDTO;
import cmpe.project.Project.DatabaseHandler.DatabaseHandler;

@Repository
public class CreditCardRepository {
    
    public boolean InsertCard(CreditCardDTO dto, Long userId) throws SQLException {
        String query = 
        "INSERT IGNORE INTO credit_cards " + 
        "(cardNumber, expirationDate, CVV, CardName, userID)" + 
        "VALUES (?, ?, ?, ?, ?);" +
        "SELECT ROW_COUNT as affected_columns;";

        Object[] params = { dto.getCardNumber(), dto.getExpDate(), dto.getCvv(), dto.getName() };

        ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query, params);
        while(rs.next()){
            if(rs.getInt("affected_columns") == 0)
                return false;
        }
        return true;
    }

    public List<CreditCardDTO> GetCardByList(Long userId) throws SQLException {
        String query = 
        "SELECT cardNumber, expirationDate, CVV, CardName, " +
        "FROM credit_cards " +
        "WHERE userID = ?;";

        Object[] param = { userId };

        ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query, param);
        List<CreditCardDTO> list = new ArrayList<>();
        while(rs.next()) {
            CreditCardDTO dto = new CreditCardDTO();
            dto.setCardNumber(rs.getString("cardNumber"));
            dto.setExpDate(rs.getString("expirationDate"));
            dto.setCvv(rs.getInt("CVV"));
            dto.setName(rs.getString("CardName"));
            list.add(dto);
        }
        return list;
    }

    public void AssignToPayment(CreditCardDTO creditCard, long paymentId) throws SQLException {
        String query = 
        "SELECT cardID " +
        "FROM credit_cards " +
        "WHERE cardNumber = ?, expirationDate = ?, CVV = ?";

        Object[] params = { creditCard.getCardNumber(), creditCard.getExpDate(), creditCard.getCvv() };

        ResultSet rs = DatabaseHandler.INSTANCE.sendRequest(query, params);
        String assignQuery = 
        "UPDATE payments SET card_id = ? WHERE payment_id = ?";

        while (rs.next()) {
            Object[] param = { rs.getInt(1) };
            DatabaseHandler.INSTANCE.executeQuery(assignQuery, param);
        }
    }
}
