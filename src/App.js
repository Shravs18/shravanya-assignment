import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from "react-bootstrap/Table";

function calculateRewardPoints(data) {

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const checkPointsPerTransaction = data.data.map((transaction) => {
    let points = 0;
    let isGreaterThan100 = transaction.amount - 100;

    // A user receives 2 points for every dollar spent over $100 in each transaction
    if (isGreaterThan100 > 0) {
      points += isGreaterThan100 * 2;
    }
    // plus 1 point for every dollar spent over $50 in each transaction
    if (transaction.amount > 50) {
      points += 50;
    }
    const month = new Date(transaction.dateOfTransaction).getMonth();
    
    return { ...transaction, points, month };
  });


  let byCustomer = {};
  let totalPointsByCustomer = {};

  checkPointsPerTransaction.forEach((checkPointsPerTransaction) => {
    let { customerID, name, month, points } = checkPointsPerTransaction;
   
    if (!byCustomer[customerID]) {
      byCustomer[customerID] = [];
    }

    if (!totalPointsByCustomer[customerID]) {
      totalPointsByCustomer[name] = 0;
    }
    totalPointsByCustomer[name] += points;
    if (byCustomer[customerID][month]) {
      byCustomer[customerID][month].points += points;
      byCustomer[customerID][month].monthNumber = month;
      byCustomer[customerID][month].numTransactions++;
    } else {
      byCustomer[customerID][month] = {
        customerID,
        name,
        monthNumber: month,
        month: months[month],
        numTransactions: 1,
        points,
      };
    }
  });
  
  let checkTotalPtByCust = [];
  for (var custKey in byCustomer) {
    byCustomer[custKey].forEach((cRow) => {
      checkTotalPtByCust.push(cRow);
    });
  }

  return {
    summaryByCustomer: checkTotalPtByCust,
    checkPointsPerTransaction,
  };
}

function App() {
  
  const [userData, setuserData] = useState(null);

 
  useEffect(() => {
    axios.get("./data.json").then((data) => {
      const result = calculateRewardPoints(data.data);
      setuserData(result);
    });
  }, []);



  return userData == null ? (
    <div>Loading...</div>
  ) : (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Points Rewards System</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Sr.No.</th>
                  <th>Customer Name</th>
                  <th>Number of Transaction</th>
                  <th>Months</th>
                  <th>Reward Points</th>
                </tr>
              </thead>
              <tbody>
                {userData.summaryByCustomer.map((trans, i) => {
                  return (<tr key={i}>
                  <td>{i + 1}</td>
                  <td>{trans.name}</td>
                  <td>{trans.numTransactions}</td>
                  <td>{trans.month}</td>
                  <td>{trans.points}</td>
                </tr>)
                })}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
