package cmpe.project.Project.Services;

import java.math.BigDecimal;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cmpe.project.Project.DTOs.CreditCardDTO;
import cmpe.project.Project.Repositories.CreditCardRepository;

@Service
public class CreditCardService {
    
    @Autowired
    private CreditCardRepository creditCardRepository;

    // Luhn algorithm
    public static boolean isValidCardNumber(String cardNumber) {
        // Remove all spaces or non-numeric characters
        cardNumber = cardNumber.replaceAll("\\s", "");
        
        // Check if the card number contains only digits
        if (!cardNumber.matches("\\d+")) {
            return false;
        }

        int sum = 0;
        boolean alternate = false;
        
        // Loop through the card number from right to left
        for (int i = cardNumber.length() - 1; i >= 0; i--) {
            int n = Integer.parseInt(cardNumber.substring(i, i + 1));
            
            // Double every second digit
            if (alternate) {
                n *= 2;
                // If doubling results in a number greater than 9, subtract 9
                if (n > 9) {
                    n -= 9;
                }
            }
            
            // Add the digit to the sum
            sum += n;
            alternate = !alternate;
        }
        
        // The card is valid if the sum is divisible by 10
        return (sum % 10 == 0);
    }

    public boolean SaveCard(CreditCardDTO creditCard, long userId) throws SQLException {
        return creditCardRepository.InsertCard(creditCard, userId);
    }

    public void SaveCardForPayment(CreditCardDTO creditCard, long paymentId) throws SQLException {
        creditCardRepository.InsertCard(creditCard, null);
        creditCardRepository.AssignToPayment(creditCard, paymentId);
    }

    public boolean HandleTransaction(CreditCardDTO creditCard, BigDecimal totalCost) {
        if(isValidCardNumber(creditCard.getCardNumber()))
            return true;
        return false;
            
    }
    
}
