"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Wallet, BarChart2, Clock, PlusCircle, Trash2, PieChart as PieChartIcon, Calendar, Tag, TrendingUp } from "lucide-react";
import CategoryBadge from "@/components/CategoryBadge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";

// Categories for transactions
const categories = ["Food", "Transport", "Bills", "Entertainment", "Shopping", "Others"];

// Category colors
export const categoryColors: Record<string, string> = {
  Food: "bg-blue-100 text-blue-600",
  Transport: "bg-green-100 text-green-600",
  Bills: "bg-yellow-100 text-yellow-600",
  Entertainment: "bg-purple-100 text-purple-600",
  Shopping: "bg-pink-100 text-pink-600",
  Others: "bg-gray-100 text-gray-600",
};

// Pie chart colors
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'];

interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  category: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [categoryBudgets, setCategoryBudgets] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  // Initialize with current date
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
  }, []);

  const addTransaction = () => {
    if (!amount || !description || !date || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to add a transaction",
        variant: "destructive"
      });
      return;
    }
    
    const newTransaction: Transaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      description,
      date,
      category,
    };
    
    setTransactions([newTransaction, ...transactions]);
    setAmount("");
    setDescription("");
    setCategory("");
    
    toast({
      title: "Transaction Added",
      description: `${formatCurrency(parseFloat(amount))} transaction has been recorded`,
      variant: "default"
    });
  };

  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // Grouping transactions by category for pie chart
  const categoryData = transactions.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = Object.entries(categoryData).map(([category, total]) => ({
    name: category,
    value: total,
  }));

  // Summary Data
  const totalExpenses = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const mostUsedCategory = Object.entries(categoryData).length > 0 
    ? Object.entries(categoryData).reduce<[string, number]>(
        (a, b) => (a[1] > b[1] ? a : b), 
        ["", 0]
      )[0]
    : "";

  // Handle setting monthly budgets for each category
  const handleBudgetChange = (category: string, budget: string) => {
    setCategoryBudgets({
      ...categoryBudgets,
      [category]: parseFloat(budget) || 0,
    });
  };

  // Budget vs Actual Comparison Chart
  const budgetComparisonData = Object.keys(categoryBudgets).map((category) => ({
    category,
    budget: categoryBudgets[category] || 0,
    actual: categoryData[category] || 0,
  }));

  // Spending Insights
  const getRemainingBudget = (category: string) => {
    return (categoryBudgets[category] || 0) - (categoryData[category] || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 py-10 px-4 md:px-10">
      <motion.div 
        className="max-w-6xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="text-center mb-8"
          variants={itemVariants}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-2">
            Personal Finance Tracker
          </h1>
          <p className="text-gray-500 text-lg animate__animated animate__fadeIn animate__delay-1s">
            Take control of your finances with ease and precision
          </p>
        </motion.div>

        {/* Dashboard Summary Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-custom p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-secondary-500 font-medium text-sm mb-1">Total Expenses</h3>
                <p className="text-3xl font-bold text-primary-700">₹{totalExpenses.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            {transactions.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Recent transactions recorded</span>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-custom p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-secondary-500 font-medium text-sm mb-1">Most Used Category</h3>
                <p className="text-3xl font-bold text-primary-700">{mostUsedCategory || "N/A"}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <BarChart2 className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            {mostUsedCategory && categoryBudgets[mostUsedCategory] && (
              <div className="mt-4">
                <div className="budget-progress h-2.5 rounded-full bg-secondary-200 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-primary-500"
                    style={{ 
                      width: `${Math.min(100, (categoryData[mostUsedCategory] / categoryBudgets[mostUsedCategory]) * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-secondary-500">
                  <span>₹{categoryData[mostUsedCategory]?.toFixed(0) || 0} spent</span>
                  <span>₹{categoryBudgets[mostUsedCategory]?.toFixed(0) || 0} budget</span>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-custom p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-secondary-500 font-medium text-sm mb-1">Latest Transaction</h3>
                <p className="text-xl font-bold text-primary-700 truncate max-w-[180px]">
                  {transactions.length > 0 ? transactions[0].description : "No transactions yet"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            {transactions.length > 0 && (
              <div className="mt-4 flex items-end justify-between">
                <span className="text-sm text-secondary-500">{transactions[0].date}</span>
                <span className="text-lg font-semibold text-primary-700">₹{transactions[0].amount.toFixed(2)}</span>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Budget Setup Card */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl shadow-custom p-6"
        >
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-bold text-primary-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Set Monthly Budgets
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((cat, index) => (
                <motion.div 
                  key={cat} 
                  className="mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-secondary-600 font-medium">{cat}</label>
                    <span className="text-xs text-primary-600 font-semibold">
                      {categoryBudgets[cat] ? `₹${categoryBudgets[cat]}` : ''}
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      value={categoryBudgets[cat] || ""}
                      onChange={(e) => handleBudgetChange(cat, e.target.value)}
                      placeholder="Set budget"
                      className="w-full px-4 py-2 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-secondary-400">
                      ₹
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </motion.div>

        {/* Styled Add Transaction Card */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl shadow-custom p-6"
        >
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-bold text-primary-800 flex items-center">
              <PlusCircle className="h-6 w-6 mr-2 text-primary-600" />
              Add New Transaction
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-secondary-400">
                  ₹
                </div>
                <Input
                  placeholder="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 pr-4 py-2 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                />
              </div>
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-4 py-2 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
              />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
              />
              <div className="relative">
                <select
                  className="w-full px-4 py-2 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-secondary-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                className="gradient-button text-white font-medium py-2 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-300 flex items-center justify-center transition-all"
                onClick={addTransaction}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Transaction
              </Button>
            </div>
          </CardContent>
        </motion.div>

        {/* Transaction List */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl shadow-custom p-6"
        >
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-bold text-primary-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-4">
            {transactions.length === 0 ? (
              <p className="text-sm text-secondary-500 text-center py-4">
                No transactions yet. Add your first transaction above!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-secondary-200">
                      <th className="text-left text-sm font-semibold text-secondary-500 py-3">Date</th>
                      <th className="text-left text-sm font-semibold text-secondary-500 py-3">Description</th>
                      <th className="text-left text-sm font-semibold text-secondary-500 py-3">Category</th>
                      <th className="text-right text-sm font-semibold text-secondary-500 py-3">Amount</th>
                      <th className="text-right text-sm font-semibold text-secondary-500 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {transactions.map((t, index) => (
                        <motion.tr 
                          key={t.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.3 }}
                          className="border-b border-secondary-100 hover:bg-primary-50 transition-colors"
                        >
                          <td className="py-3 text-sm text-secondary-600">{t.date}</td>
                          <td className="py-3 text-sm font-medium text-secondary-800">{t.description}</td>
                          <td className="py-3">
                            <CategoryBadge category={t.category} />
                          </td>
                          <td className="py-3 text-sm font-semibold text-right text-secondary-800">₹{t.amount.toFixed(2)}</td>
                          <td className="py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteTransaction(t.id)}
                              className="text-red-500 hover:text-red-700 transition-colors focus:outline-none"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Budget vs Actual Comparison Chart */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-custom p-6"
          >
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-bold text-primary-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Budget vs Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-4 h-[300px]">
              {budgetComparisonData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-secondary-500">
                    Set budgets and add transactions to see comparison chart.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={budgetComparisonData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                  >
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Bar
                      dataKey="budget"
                      fill="#3B82F6"
                      radius={[5, 5, 0, 0]}
                      animationDuration={1500}
                      name="Budget"
                    />
                    <Bar
                      dataKey="actual"
                      fill="#9DB2BF"
                      radius={[5, 5, 0, 0]}
                      animationDuration={1500}
                      animationBegin={300}
                      name="Actual"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </motion.div>

          {/* Category-wise Pie Chart */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-custom p-6"
          >
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-bold text-primary-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-4 h-[300px]">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-secondary-500">
                    Add transactions to see category breakdown.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      animationDuration={1500}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          variants={itemVariants}
          className="text-center text-secondary-500 text-sm mt-12"
        >
          <p>Personal Finance Tracker | Designed with ❤️</p>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default TransactionsPage;
