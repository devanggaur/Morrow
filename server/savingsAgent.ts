interface Transaction {
  date: string;
  amount: number;
  merchantName: string;
  personalFinanceCategory: string;
}

// Windfall Wallet - Detects large deposits and suggests saving
export function detectWindfall(transactions: Transaction[]) {
  try {
    // Get income transactions (negative amounts in Plaid = income)
    const incomeTransactions = transactions.filter(
      (t) => t.amount < 0 && t.personalFinanceCategory?.includes('INCOME')
    );

    if (incomeTransactions.length === 0) {
      return {
        hasWindfall: false,
        suggestion: null,
      };
    }

    // Calculate median monthly income
    const monthlyIncomes: { [key: string]: number } = {};
    incomeTransactions.forEach((t) => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyIncomes[month]) {
        monthlyIncomes[month] = 0;
      }
      monthlyIncomes[month] += Math.abs(t.amount);
    });

    const incomeValues = Object.values(monthlyIncomes);
    const medianIncome = incomeValues.sort((a, b) => a - b)[Math.floor(incomeValues.length / 2)] || 0;

    // Find transactions in last 30 days that are > 1.5x median income
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const windfall = incomeTransactions.find((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate >= thirtyDaysAgo &&
        Math.abs(t.amount) > medianIncome * 1.5
      );
    });

    if (windfall) {
      const suggestedAmount = Math.abs(windfall.amount) * 0.2; // Suggest 20%

      return {
        hasWindfall: true,
        suggestion: {
          type: 'windfall',
          amount: Math.abs(windfall.amount),
          suggestedSave: Math.round(suggestedAmount * 100) / 100,
          merchantName: windfall.merchantName,
          date: windfall.date,
          message: `Great news! We detected a windfall of $${Math.abs(windfall.amount).toFixed(2)}. Save 20% before it gets mentally budgeted.`,
        },
      };
    }

    return {
      hasWindfall: false,
      suggestion: null,
    };
  } catch (error) {
    console.error('Error detecting windfall:', error);
    return {
      hasWindfall: false,
      suggestion: null,
    };
  }
}

// Smart Sweep - Weekly budget analysis
export function analyzeWeeklySweep(transactions: Transaction[]) {
  try {
    // Get spending transactions (positive amounts = outflow)
    const spendingTransactions = transactions.filter((t) => t.amount > 0);

    if (spendingTransactions.length === 0) {
      return {
        hasSweep: false,
        suggestion: null,
      };
    }

    // Calculate this week's spending
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

    const thisWeekSpending = spendingTransactions
      .filter((t) => new Date(t.date) >= thisWeekStart)
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate 4-week average
    const fourWeeksAgo = new Date(today);
    fourWeeksAgo.setDate(today.getDate() - 28);

    const last4WeeksSpending = spendingTransactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return tDate >= fourWeeksAgo && tDate < thisWeekStart;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const weeklyAverage = last4WeeksSpending / 4;

    // Check if there's unspent budget
    const unspentBudget = weeklyAverage - thisWeekSpending;

    if (unspentBudget > 5) {
      const suggestedAmount = unspentBudget * 0.5; // Suggest 50%

      return {
        hasSweep: true,
        suggestion: {
          type: 'sweep',
          weeklyAverage: Math.round(weeklyAverage * 100) / 100,
          thisWeekSpending: Math.round(thisWeekSpending * 100) / 100,
          unspentBudget: Math.round(unspentBudget * 100) / 100,
          suggestedSave: Math.round(suggestedAmount * 100) / 100,
          message: `You're $${unspentBudget.toFixed(2)} under your weekly average. Save half of it?`,
        },
      };
    }

    return {
      hasSweep: false,
      suggestion: null,
    };
  } catch (error) {
    console.error('Error analyzing sweep:', error);
    return {
      hasSweep: false,
      suggestion: null,
    };
  }
}

// Triple Play Analysis - Runs both windfall and sweep
export function runTriplePlayAnalysis(transactions: Transaction[]) {
  const windfall = detectWindfall(transactions);
  const sweep = analyzeWeeklySweep(transactions);

  return {
    windfall: windfall.suggestion,
    sweep: sweep.suggestion,
    hasOpportunities: windfall.hasWindfall || sweep.hasSweep,
  };
}

// Fresh Start Detector - Temporal landmarks
export function detectFreshStart(userId: string) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayOfMonth = today.getDate();
  const month = today.getMonth();

  // Priority order: New Year > Month Start > Monday
  if (month === 0 && dayOfMonth === 1) {
    return {
      hasFreshStart: true,
      landmark: 'New Year',
      emoji: '🎊',
      message: 'New year, new savings goals! Start fresh with a 15% boost to your savings.',
      suggestedIncrease: 0.15,
    };
  }

  if (dayOfMonth === 1) {
    return {
      hasFreshStart: true,
      landmark: 'Month Start',
      emoji: '📅',
      message: 'New month, fresh start! Boost your savings by 10% this month.',
      suggestedIncrease: 0.10,
    };
  }

  if (dayOfWeek === 1) {
    // Monday
    return {
      hasFreshStart: true,
      landmark: 'Monday',
      emoji: '💪',
      message: 'Fresh week ahead! Consider increasing your savings by 5%.',
      suggestedIncrease: 0.05,
    };
  }

  return {
    hasFreshStart: false,
    landmark: null,
    message: null,
  };
}

// Soft Lock - Calculate withdrawal impact
export function calculateWithdrawalImpact(
  vaultGoal: number,
  currentBalance: number,
  withdrawAmount: number
) {
  const progressBefore = (currentBalance / vaultGoal) * 100;
  const progressAfter = ((currentBalance - withdrawAmount) / vaultGoal) * 100;
  const progressLost = progressBefore - progressAfter;

  const daysToGoalBefore = Math.ceil((vaultGoal - currentBalance) / 5); // Assuming $5/day savings
  const daysToGoalAfter = Math.ceil((vaultGoal - (currentBalance - withdrawAmount)) / 5);
  const daysDelayed = daysToGoalAfter - daysToGoalBefore;

  return {
    progressBefore: Math.round(progressBefore * 100) / 100,
    progressAfter: Math.round(progressAfter * 100) / 100,
    progressLost: Math.round(progressLost * 100) / 100,
    daysDelayed: daysDelayed,
    impactMessage: `Withdrawing $${withdrawAmount.toFixed(2)} will set you back ${daysDelayed} days and reduce your progress by ${progressLost.toFixed(1)}%.`,
  };
}
