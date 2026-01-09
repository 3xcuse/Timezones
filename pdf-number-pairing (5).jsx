import React, { useState } from 'react';

export default function PDFNumberPairing() {
  // Initial state for reset functionality
  const initialCurrentYearItems = [
    { id: 1, value: 5420000, topic: 'Total Revenue', source: 'CY' },
    { id: 2, value: 3250000, topic: 'Cost of Goods Sold', source: 'CY' },
    { id: 3, value: 1000000, topic: 'Marketing Expenses', source: 'CY' },
    { id: 4, value: 2170000, topic: 'Gross Profit', source: 'CY' },
    { id: 5, value: 1320000, topic: 'Operating Income', source: 'CY' },
    { id: 6, value: 850000, topic: 'Operating Expenses', source: 'CY' },
    { id: 7, value: 1000000, topic: 'Research and Development', source: 'CY' },
    { id: 8, value: 45000, topic: 'Interest Expense', source: 'CY' },
    { id: 9, value: 125000, topic: 'Income Tax Expense', source: 'CY' },
    { id: 10, value: 1150000, topic: 'Net Income', source: 'CY' },
    { id: 11, value: 325000, topic: 'Accounts Receivable', source: 'CY' },
    { id: 12, value: 1000000, topic: 'Inventory', source: 'CY' },
    { id: 13, value: 8500000, topic: 'Total Assets', source: 'CY' },
    { id: 14, value: 1875000, topic: 'Property and Equipment', source: 'CY' },
    { id: 15, value: 4200000, topic: 'Total Liabilities', source: 'CY' }
  ];

  const initialPriorYearItems = [
    { id: 1, value: 5420000, topic: 'Total Revenue', source: 'PP1' },
    { id: 2, value: 1000000, topic: 'Marketing Expenses', source: 'PP1' },
    { id: 3, value: 3250000, topic: 'Cost of Goods Sold', source: 'PP2' },
    { id: 4, value: 2170000, topic: 'Gross Profit', source: 'PP1' },
    { id: 5, value: 850000, topic: 'Operating Expenses', source: 'PP2' },
    { id: 6, value: 1320000, topic: 'Operating Income', source: 'PP1' },
    { id: 7, value: 45000, topic: 'Interest Expense', source: 'PP2' },
    { id: 8, value: 1000000, topic: 'Research and Development', source: 'PP1' },
    { id: 9, value: 125000, topic: 'Income Tax Expense', source: 'PP2' },
    { id: 10, value: 1150000, topic: 'Net Income', source: 'PP1' },
    { id: 11, value: 1000000, topic: 'Inventory', source: 'PP2' },
    { id: 12, value: 8500000, topic: 'Total Assets', source: 'PP1' },
    { id: 13, value: 325000, topic: 'Accounts Receivable', source: 'PP2' },
    { id: 14, value: 2950000, topic: 'Long-term Debt', source: 'PP1' },
    { id: 15, value: 780000, topic: 'Cash and Equivalents', source: 'PP2' }
  ];

  const [currentYearItems, setCurrentYearItems] = useState(initialCurrentYearItems);
  const [priorYearItems, setPriorYearItems] = useState(initialPriorYearItems);

  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [sourceFilter, setSourceFilter] = useState('PP1');

  const handleDelete = (index, column) => {
    setHoveredItem(null);
    
    if (column === 'current') {
      const filteredPrior = priorYearItems.filter(item => item.source === sourceFilter);
      const pairedPriorItem = filteredPrior[index];
      
      // Delete from Current Year
      const newCurrentItems = currentYearItems.filter((_, i) => i !== index);
      setCurrentYearItems(newCurrentItems);
      
      // If paired Prior Year item is a placeholder, delete it too
      if (pairedPriorItem?.isPlaceholder) {
        const newPriorItems = priorYearItems.filter(item => item.id !== pairedPriorItem.id);
        setPriorYearItems(newPriorItems);
      }
    } else {
      const deletedItem = priorYearItems[index];
      const filteredPrior = priorYearItems.filter(item => item.source === sourceFilter);
      const localIndex = filteredPrior.findIndex(item => item.id === deletedItem.id);
      const pairedCurrentItem = currentYearItems[localIndex];
      
      // Delete from Prior Year
      const newPriorItems = priorYearItems.filter((_, i) => i !== index);
      setPriorYearItems(newPriorItems);
      
      // If paired Current Year item is a placeholder, delete it too
      if (pairedCurrentItem?.isPlaceholder) {
        const newCurrentItems = currentYearItems.filter(item => item.id !== pairedCurrentItem.id);
        setCurrentYearItems(newCurrentItems);
      }
    }
  };
  
  // Automatically cleanup empty rows (both sides are placeholders) whenever items change
  React.useEffect(() => {
    const filteredPrior = priorYearItems.filter(item => item.source === sourceFilter);
    const maxLength = Math.max(currentYearItems.length, filteredPrior.length);
    
    // Find indices where both sides are placeholders
    const indicesToRemove = [];
    for (let i = 0; i < maxLength; i++) {
      const currentItem = currentYearItems[i];
      const priorItem = filteredPrior[i];
      
      if (currentItem?.isPlaceholder && priorItem?.isPlaceholder) {
        indicesToRemove.push(i);
      }
    }
    
    if (indicesToRemove.length > 0) {
      // Remove from Current Year
      const newCurrentItems = currentYearItems.filter((_, idx) => !indicesToRemove.includes(idx));
      
      // Remove from Prior Year (by ID)
      const priorIdsToRemove = new Set();
      indicesToRemove.forEach(idx => {
        const priorItem = filteredPrior[idx];
        if (priorItem?.isPlaceholder) {
          priorIdsToRemove.add(priorItem.id);
        }
      });
      const newPriorItems = priorYearItems.filter(item => !priorIdsToRemove.has(item.id));
      
      // Only update if something changed
      if (newCurrentItems.length !== currentYearItems.length || newPriorItems.length !== priorYearItems.length) {
        setCurrentYearItems(newCurrentItems);
        setPriorYearItems(newPriorItems);
      }
    }
  }, [currentYearItems, priorYearItems, sourceFilter]);

  const handleReset = () => {
    setCurrentYearItems(initialCurrentYearItems);
    setPriorYearItems(initialPriorYearItems);
  };

  const handleAutoMatch = () => {
    // Remove all existing placeholders from current items first
    const currentItems = currentYearItems.filter(item => !item.isPlaceholder);
    const priorItems = priorYearItems.filter(item => item.source === sourceFilter && !item.isPlaceholder);
    
    // For each current item, find matching prior item or use placeholder
    const reorderedPrior = [];
    const usedPriorIndices = new Set();
    
    currentItems.forEach((currentItem) => {
      const matchingPriorIdx = priorItems.findIndex(
        (priorItem, idx) => 
          !usedPriorIndices.has(idx) && 
          priorItem.value === currentItem.value
      );
      
      if (matchingPriorIdx !== -1) {
        // Found a match
        reorderedPrior.push(priorItems[matchingPriorIdx]);
        usedPriorIndices.add(matchingPriorIdx);
      } else {
        // No match found, insert placeholder
        reorderedPrior.push({
          id: `placeholder-pp-${Date.now()}-${Math.random()}`,
          value: null,
          topic: 'No Match',
          isPlaceholder: true,
          source: sourceFilter
        });
      }
    });
    
    // Add any remaining unmatched prior items at the end
    priorItems.forEach((item, idx) => {
      if (!usedPriorIndices.has(idx)) {
        reorderedPrior.push(item);
      }
    });
    
    // Update priorYearItems by replacing items of this source (remove old placeholders first)
    const newPriorItems = [
      ...priorYearItems.filter(item => item.source !== sourceFilter),
      ...reorderedPrior
    ];
    
    setPriorYearItems(newPriorItems);
  };

  const handleSaveMatches = () => {
    const filteredPrior = priorYearItems.filter(item => item.source === sourceFilter);
    const matchingIndices = [];
    const minLength = Math.min(currentYearItems.length, filteredPrior.length);
    
    // Find matching pairs
    for (let i = 0; i < minLength; i++) {
      const currentItem = currentYearItems[i];
      const priorItem = filteredPrior[i];
      if (!currentItem?.isPlaceholder && !priorItem?.isPlaceholder && currentItem?.value === priorItem?.value) {
        matchingIndices.push(i);
      }
    }
    
    // Remove from Current Year
    const newCurrentItems = currentYearItems.filter((_, idx) => !matchingIndices.includes(idx));
    
    // Remove from Prior Year (need to find global indices)
    const priorIdsToRemove = new Set();
    matchingIndices.forEach(idx => {
      const priorItem = filteredPrior[idx];
      if (priorItem) {
        priorIdsToRemove.add(priorItem.id);
      }
    });
    const newPriorItems = priorYearItems.filter(item => !priorIdsToRemove.has(item.id));
    
    setCurrentYearItems(newCurrentItems);
    setPriorYearItems(newPriorItems);
    
    const savedCount = matchingIndices.length;
    setToastMessage(`${savedCount} Saved.`);
    
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSavePairs = () => {
    const filteredPrior = priorYearItems.filter(item => item.source === sourceFilter);
    const minLength = Math.min(currentYearItems.length, filteredPrior.length);
    
    let matchCount = 0;
    let differenceCount = 0;
    const pairIndicesToRemove = [];
    
    // Count matches and differences, collect indices to remove
    for (let i = 0; i < minLength; i++) {
      const currentItem = currentYearItems[i];
      const priorItem = filteredPrior[i];
      
      // Skip if either is a placeholder
      if (currentItem?.isPlaceholder || priorItem?.isPlaceholder) {
        continue;
      }
      
      pairIndicesToRemove.push(i);
      
      if (currentItem?.value === priorItem?.value) {
        matchCount++;
      } else {
        differenceCount++;
      }
    }
    
    const totalSaved = matchCount + differenceCount;
    
    // Remove saved pairs from Current Year
    const newCurrentItems = currentYearItems.filter((_, idx) => !pairIndicesToRemove.includes(idx));
    
    // Remove saved pairs from Prior Year (by ID)
    const priorIdsToRemove = new Set();
    pairIndicesToRemove.forEach(idx => {
      const priorItem = filteredPrior[idx];
      if (priorItem && !priorItem.isPlaceholder) {
        priorIdsToRemove.add(priorItem.id);
      }
    });
    const newPriorItems = priorYearItems.filter(item => !priorIdsToRemove.has(item.id));
    
    setCurrentYearItems(newCurrentItems);
    setPriorYearItems(newPriorItems);
    
    // Show detailed toast message
    const messages = [];
    messages.push(`${totalSaved} Saved.`);
    if (matchCount > 0) messages.push(`${matchCount} Match saved.`);
    if (differenceCount > 0) messages.push(`${differenceCount} Difference saved.`);
    
    setToastMessage(messages.join(' '));
    
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleDragStart = (index, column) => {
    setDraggedItem(index);
    setDraggedFromColumn(column);
    setHoveredItem(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedFromColumn === null) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedFromColumn(null);
    setDragOverIndex(null);
  };

  const handleDrop = (targetIndex, targetColumn) => {
    if (draggedItem === null || draggedFromColumn !== targetColumn) {
      setDraggedItem(null);
      setDraggedFromColumn(null);
      setDragOverIndex(null);
      return;
    }

    if (targetColumn === 'current') {
      const newItems = [...currentYearItems];
      [newItems[draggedItem], newItems[targetIndex]] = [newItems[targetIndex], newItems[draggedItem]];
      setCurrentYearItems(newItems);
    } else {
      const newItems = [...priorYearItems];
      [newItems[draggedItem], newItems[targetIndex]] = [newItems[targetIndex], newItems[draggedItem]];
      setPriorYearItems(newItems);
    }

    setDraggedItem(null);
    setDraggedFromColumn(null);
    setDragOverIndex(null);
  };

  const getItemColor = (currentValue, priorValue) => {
    if (currentValue === null || priorValue === null) return 'bg-gray-100 border-gray-300';
    return currentValue === priorValue ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400';
  };

  const shouldBeBold = (index, column) => {
    if (draggedItem === null || draggedFromColumn === null) return false;
    
    const draggedValue = draggedFromColumn === 'current' 
      ? currentYearItems[draggedItem]?.value 
      : priorYearItems[draggedItem]?.value;
    
    if (draggedFromColumn === 'current' && column === 'prior') {
      return priorYearItems[index]?.value === draggedValue;
    } else if (draggedFromColumn === 'prior' && column === 'current') {
      return currentYearItems[index]?.value === draggedValue;
    }
    
    return false;
  };

  const isDuplicate = (value, column) => {
    if (value === null) return false;
    const items = column === 'current' ? currentYearItems : priorYearItems;
    return items.filter(item => item.value === value).length > 1;
  };

  // Filter prior year items by selected source
  const filteredPriorYearItems = priorYearItems.filter(item => item.source === sourceFilter);
  
  // Create filtered pairs - only show rows where at least one side has real data
  const displayPairs = [];
  const maxLength = Math.max(currentYearItems.length, filteredPriorYearItems.length);
  
  for (let i = 0; i < maxLength; i++) {
    const currentItem = currentYearItems[i];
    const priorItem = filteredPriorYearItems[i];
    
    // Only include row if at least one side is NOT a placeholder
    if (currentItem && priorItem && !(currentItem.isPlaceholder && priorItem.isPlaceholder)) {
      displayPairs.push({
        currentItem,
        priorItem,
        currentIndex: i,
        priorGlobalIndex: priorYearItems.findIndex(p => p.id === priorItem.id)
      });
    } else if (currentItem && !priorItem) {
      // Only current item exists
      displayPairs.push({
        currentItem,
        priorItem: null,
        currentIndex: i,
        priorGlobalIndex: -1
      });
    } else if (!currentItem && priorItem) {
      // Only prior item exists
      displayPairs.push({
        currentItem: null,
        priorItem,
        currentIndex: -1,
        priorGlobalIndex: priorYearItems.findIndex(p => p.id === priorItem.id)
      });
    } else if (currentItem && !currentItem.isPlaceholder) {
      // Current exists and is not placeholder
      displayPairs.push({
        currentItem,
        priorItem,
        currentIndex: i,
        priorGlobalIndex: priorItem ? priorYearItems.findIndex(p => p.id === priorItem.id) : -1
      });
    } else if (priorItem && !priorItem.isPlaceholder) {
      // Prior exists and is not placeholder
      displayPairs.push({
        currentItem,
        priorItem,
        currentIndex: i,
        priorGlobalIndex: priorYearItems.findIndex(p => p.id === priorItem.id)
      });
    }
  }
  
  // Ensure both columns have the same length by adding real placeholders to state
  React.useEffect(() => {
    const maxLength = Math.max(currentYearItems.length, filteredPriorYearItems.length);
    
    // Add placeholders to Current Year if needed
    if (currentYearItems.length < maxLength) {
      const newPlaceholders = [];
      for (let i = currentYearItems.length; i < maxLength; i++) {
        newPlaceholders.push({
          id: `placeholder-cy-${Date.now()}-${i}`,
          value: null,
          topic: 'No Match',
          isPlaceholder: true,
          source: 'CY'
        });
      }
      setCurrentYearItems([...currentYearItems, ...newPlaceholders]);
    }
    
    // Add placeholders to Prior Year (for this source) if needed
    const priorOfThisSource = priorYearItems.filter(item => item.source === sourceFilter);
    if (priorOfThisSource.length < maxLength) {
      const newPlaceholders = [];
      for (let i = priorOfThisSource.length; i < maxLength; i++) {
        newPlaceholders.push({
          id: `placeholder-pp-${sourceFilter}-${Date.now()}-${i}`,
          value: null,
          topic: 'No Match',
          isPlaceholder: true,
          source: sourceFilter
        });
      }
      const otherSourceItems = priorYearItems.filter(item => item.source !== sourceFilter);
      setPriorYearItems([...otherSourceItems, ...priorOfThisSource, ...newPlaceholders]);
    }
  }, [sourceFilter, currentYearItems.length, filteredPriorYearItems.length]);

  // Render Current Year item
  const renderCurrentItem = (item, index, priorItem) => {
    if (item.isPlaceholder) {
      return (
        <div
          key={item.id}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index, 'current')}
          className={`p-2 rounded border border-gray-300 bg-gray-100 transition-all duration-200 ${
            draggedItem === index && draggedFromColumn === 'current' 
              ? 'opacity-40' 
              : ''
          } ${
            dragOverIndex === index && draggedFromColumn === 'current' && draggedItem !== index
              ? 'ring-2 ring-blue-400 scale-105'
              : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              draggable
              onDragStart={() => handleDragStart(index, 'current')}
              onDragEnd={handleDragEnd}
              className="cursor-move flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="4" cy="3" r="1.5" />
                <circle cx="4" cy="8" r="1.5" />
                <circle cx="4" cy="13" r="1.5" />
                <circle cx="12" cy="3" r="1.5" />
                <circle cx="12" cy="8" r="1.5" />
                <circle cx="12" cy="13" r="1.5" />
              </svg>
            </div>
            <span className="text-sm text-gray-400 italic flex-1">No Match</span>
            {!item.isPlaceholder && (
              <button
                onClick={() => handleDelete(index, 'current')}
                className="text-gray-400 hover:text-red-500 flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {item.isPlaceholder && <div className="w-3.5 h-3.5 flex-shrink-0"></div>}
          </div>
        </div>
      );
    }

    return (
      <div
        key={item.id}
        onDragOver={(e) => handleDragOver(e, index)}
        onDrop={() => handleDrop(index, 'current')}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoveredItem({ 
            column: 'current', 
            index,
            rect: { top: rect.bottom, left: rect.left + rect.width / 2 }
          });
        }}
        onMouseLeave={() => setHoveredItem(null)}
        className={`p-2 rounded border transition-all duration-200 hover:shadow ${getItemColor(
          item.value,
          priorItem?.value
        )} ${
          draggedItem === index && draggedFromColumn === 'current' 
            ? 'opacity-40' 
            : ''
        } ${
          dragOverIndex === index && draggedFromColumn === 'current' && draggedItem !== index
            ? 'ring-2 ring-blue-400 scale-105'
            : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            draggable
            onDragStart={() => handleDragStart(index, 'current')}
            onDragEnd={handleDragEnd}
            className="cursor-move flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="4" cy="3" r="1.5" />
              <circle cx="4" cy="8" r="1.5" />
              <circle cx="4" cy="13" r="1.5" />
              <circle cx="12" cy="3" r="1.5" />
              <circle cx="12" cy="8" r="1.5" />
              <circle cx="12" cy="13" r="1.5" />
            </svg>
          </div>
          <span className={`text-sm font-medium text-gray-800 flex-1 transition-all ${shouldBeBold(index, 'current') ? 'font-bold text-blue-600 scale-110' : ''} ${isDuplicate(item.value, 'current') ? 'italic' : ''}`}>
            {item.value.toLocaleString()}
          </span>
          <button
            onClick={() => handleDelete(index, 'current')}
            className="text-gray-400 hover:text-red-500 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // Render Prior Year item
  const renderPriorItem = (item, globalIndex, currentItem) => {
    if (item.isPlaceholder) {
      return (
        <div
          key={item.id}
          onDragOver={(e) => handleDragOver(e, globalIndex)}
          onDrop={() => handleDrop(globalIndex, 'prior')}
          className={`p-2 rounded border border-gray-300 bg-gray-100 transition-all duration-200 ${
            draggedItem === globalIndex && draggedFromColumn === 'prior' 
              ? 'opacity-40' 
              : ''
          } ${
            dragOverIndex === globalIndex && draggedFromColumn === 'prior' && draggedItem !== globalIndex
              ? 'ring-2 ring-purple-400 scale-105'
              : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              draggable
              onDragStart={() => handleDragStart(globalIndex, 'prior')}
              onDragEnd={handleDragEnd}
              className="cursor-move flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="4" cy="3" r="1.5" />
                <circle cx="4" cy="8" r="1.5" />
                <circle cx="4" cy="13" r="1.5" />
                <circle cx="12" cy="3" r="1.5" />
                <circle cx="12" cy="8" r="1.5" />
                <circle cx="12" cy="13" r="1.5" />
              </svg>
            </div>
            <span className="text-sm text-gray-400 italic flex-1">No Match</span>
            {!item.isPlaceholder && (
              <button
                onClick={() => handleDelete(globalIndex, 'prior')}
                className="text-gray-400 hover:text-red-500 flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {item.isPlaceholder && <div className="w-3.5 h-3.5 flex-shrink-0"></div>}
          </div>
        </div>
      );
    }

    return (
      <div
        key={item.id}
        onDragOver={(e) => handleDragOver(e, globalIndex)}
        onDrop={() => handleDrop(globalIndex, 'prior')}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoveredItem({ 
            column: 'prior', 
            index: globalIndex,
            rect: { top: rect.bottom, left: rect.left + rect.width / 2 }
          });
        }}
        onMouseLeave={() => setHoveredItem(null)}
        className={`p-2 rounded border transition-all duration-200 hover:shadow ${getItemColor(
          currentItem?.value,
          item.value
        )} ${
          draggedItem === globalIndex && draggedFromColumn === 'prior' 
            ? 'opacity-40' 
            : ''
        } ${
          dragOverIndex === globalIndex && draggedFromColumn === 'prior' && draggedItem !== globalIndex
            ? 'ring-2 ring-purple-400 scale-105'
            : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            draggable
            onDragStart={() => handleDragStart(globalIndex, 'prior')}
            onDragEnd={handleDragEnd}
            className="cursor-move flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="4" cy="3" r="1.5" />
              <circle cx="4" cy="8" r="1.5" />
              <circle cx="4" cy="13" r="1.5" />
              <circle cx="12" cy="3" r="1.5" />
              <circle cx="12" cy="8" r="1.5" />
              <circle cx="12" cy="13" r="1.5" />
            </svg>
          </div>
          <span className={`text-sm font-medium text-gray-800 flex-1 transition-all ${shouldBeBold(globalIndex, 'prior') ? 'font-bold text-purple-600 scale-110' : ''} ${isDuplicate(item.value, 'prior') ? 'italic' : ''}`}>
            {item.value.toLocaleString()}
          </span>
          <button
            onClick={() => handleDelete(globalIndex, 'prior')}
            className="text-gray-400 hover:text-red-500 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 p-3 relative">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold text-gray-800">PDF Number Pairing</h1>
        
        {/* PP1/PP2 Toggle Switch */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${sourceFilter === 'PP1' ? 'text-purple-600' : 'text-gray-500'}`}>
            PP1
          </span>
          <button
            onClick={() => setSourceFilter(sourceFilter === 'PP1' ? 'PP2' : 'PP1')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              sourceFilter === 'PP2' ? 'bg-pink-500' : 'bg-purple-500'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                sourceFilter === 'PP2' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${sourceFilter === 'PP2' ? 'text-pink-600' : 'text-gray-500'}`}>
            PP2
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 flex-1">
        {/* Current Year Column */}
        <div className="bg-white rounded-lg shadow p-3 flex flex-col">
          <h2 className="text-base font-semibold mb-2 text-gray-700 border-b border-blue-500 pb-1">
            Current Year File
          </h2>
          <div className="space-y-1.5 overflow-y-auto">
            {displayPairs.map(({ currentItem, priorItem, currentIndex }, pairIndex) => {
              if (!currentItem) return null;
              return (
                <div key={currentItem.id || `empty-cy-${pairIndex}`}>
                  {renderCurrentItem(currentItem, currentIndex, priorItem)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Prior Year Column */}
        <div className="bg-white rounded-lg shadow p-3 flex flex-col">
          <h2 className={`text-base font-semibold mb-2 text-gray-700 border-b pb-1 ${
            sourceFilter === 'PP1' ? 'border-purple-500' : 'border-pink-500'
          }`}>
            Prior Year File ({sourceFilter})
          </h2>
          <div className="space-y-1.5 overflow-y-auto">
            {displayPairs.map(({ currentItem, priorItem, priorGlobalIndex }, pairIndex) => {
              if (!priorItem) return null;
              return (
                <div key={priorItem.id || `empty-pp-${pairIndex}`}>
                  {renderPriorItem(priorItem, priorGlobalIndex, currentItem)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global Tooltip Layer */}
      {hoveredItem && hoveredItem.column === 'current' && currentYearItems[hoveredItem.index] && !currentYearItems[hoveredItem.index].isPlaceholder && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            top: `${hoveredItem.rect.top + 4}px`,
            left: `${hoveredItem.rect.left}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-2 shadow-lg whitespace-nowrap">
            {`${currentYearItems[hoveredItem.index].topic}: ${currentYearItems[hoveredItem.index].value.toLocaleString()}`}
          </div>
        </div>
      )}
      {hoveredItem && hoveredItem.column === 'prior' && priorYearItems[hoveredItem.index] && !priorYearItems[hoveredItem.index].isPlaceholder && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            top: `${hoveredItem.rect.top + 4}px`,
            left: `${hoveredItem.rect.left}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-2 shadow-lg whitespace-nowrap">
            {`${priorYearItems[hoveredItem.index].topic}: ${priorYearItems[hoveredItem.index].value.toLocaleString()}`}
          </div>
        </div>
      )}

      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg font-medium">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 flex justify-center gap-2 flex-wrap">
        <button
          onClick={handleSaveMatches}
          className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded hover:bg-emerald-600 transition-colors shadow"
        >
          Save Matches
        </button>
        <button
          onClick={handleSavePairs}
          className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded hover:bg-teal-700 transition-colors shadow"
        >
          Save Pairs
        </button>
        <button
          onClick={handleAutoMatch}
          className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors shadow"
        >
          Auto Match
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors shadow"
        >
          Revert to Default
        </button>
      </div>
    </div>
  );
}
