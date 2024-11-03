import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './VacationCalculator.css'; // Import the CSS file

const VacationCalculator = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState([]);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

     
      const parsedData = jsonData.map((row, index) => {
        if (index === 0) return row; // Пропускаем заголовок
        return {
          ФИО: row[0],
          Год: row[1],
          Месяц: row[2],
          ЗП: row[3]
        };
      }).slice(1); 

     
      for (let i = 1; i < parsedData.length; i++) {
        if (!parsedData[i].ФИО) {
          parsedData[i].ФИО = parsedData[i - 1].ФИО;
        }
      }


      const totalEarnings = {};
      const vacationPay = {};
      parsedData.forEach((row) => {
        if (!totalEarnings[row.ФИО]) {
          totalEarnings[row.ФИО] = 0;
        }
        totalEarnings[row.ФИО] += row.ЗП;
      });

      for (const [fio, earnings] of Object.entries(totalEarnings)) {
        vacationPay[fio] = earnings / 12;
      }

      // Создаем результат
      const resultData = Object.keys(totalEarnings).map((fio) => ({
        ФИО: fio,
        Общий_заработок: totalEarnings[fio],
        Размер_отпускных: vacationPay[fio]
      }));

     
      setResult(resultData);
      console.log('Result Data:', resultData); // Добавлено для отладки
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="vacation-calculator">
      <h1 className="title">Загрузка и обработка Excel-файла</h1>
      <label htmlFor="fileInput" className="file-input-label">
        Выберите и загрузите файл
      </label>
      <input
        id="fileInput"
        type="file"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      {result.length > 0 && (
        <table className="result-table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Общий заработок</th>
              <th>Размер отпускных</th>
            </tr>
          </thead>
          <tbody>
            {result.map((row, index) => (
              <tr key={index}>
                <td>{row.ФИО}</td>
                <td>{row.Общий_заработок}</td>
                <td>{row.Размер_отпускных.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VacationCalculator;
