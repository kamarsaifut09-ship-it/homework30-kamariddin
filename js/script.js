document.addEventListener('DOMContentLoaded', () => {

  const searchInput = document.querySelector('.search-box input');
  const filterChips = document.querySelectorAll('.filter-chip');
  const selectAll = document.getElementById('select-all');
  const rowCheckboxes = document.querySelectorAll('.row-checkbox');

  // Функция для автоматического скрытия или показа строк групп (`.group-row`)
  function updateGroupVisibility() {
    const groupRows = document.querySelectorAll('.warehouse-table tbody tr.group-row');
    
    groupRows.forEach(groupRow => {
      let nextRow = groupRow.nextElementSibling;
      let hasVisibleItems = false;

      while (nextRow && !nextRow.classList.contains('group-row')) {
        if (nextRow.style.display !== 'none') {
          hasVisibleItems = true;
          break;
        }
        nextRow = nextRow.nextElementSibling;
      }

      groupRow.style.display = hasVisibleItems ? '' : 'none';
    });
  }

  // Комплексный фильтр (поиск по тексту + статус-чипсы)
  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activeChip = document.querySelector('.filter-chip.active');
    const filterType = activeChip ? activeChip.textContent.toLowerCase() : 'все';

    const rows = document.querySelectorAll('.warehouse-table tbody tr:not(.group-row)');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const badge = row.querySelector('.badge');
      const badgeText = badge ? badge.textContent.toLowerCase() : '';

      const matchesSearch = text.includes(query);
      
      let matchesChip = true;
      if (filterType.includes('заканчиваются')) {
        matchesChip = badgeText.includes('заканчивается');
      } else if (filterType.includes('критично')) {
        matchesChip = badgeText.includes('критично');
      }

      if (matchesSearch && matchesChip) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    updateGroupVisibility();
    updateSelectAllState();
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyFilters();
    });
  });

  // Калькулятор степпера (+ / -) и пересчет суммы строки
  const steppers = document.querySelectorAll('.order-stepper');
  steppers.forEach(stepper => {
    const minusBtn = stepper.querySelector('.minus');
    const plusBtn = stepper.querySelector('.plus');
    const valSpan = stepper.querySelector('.step-val');

    if (minusBtn && plusBtn && valSpan) {
      const row = stepper.closest('tr');
      const unitPrice = parseInt(row.getAttribute('data-price')) || 0;
      const totalCell = row.querySelector('.item-total');

      plusBtn.addEventListener('click', () => {
        let val = parseInt(valSpan.textContent) || 0;
        val += 1;
        valSpan.textContent = val;
        
        if (totalCell) {
          let newSum = val * unitPrice;
          totalCell.textContent = newSum.toLocaleString('ru-RU') + ' сум';
        }
      });

      minusBtn.addEventListener('click', () => {
        let val = parseInt(valSpan.textContent) || 0;
        if (val > 0) {
          val -= 1;
          valSpan.textContent = val;

          if (totalCell) {
            let newSum = val * unitPrice;
            totalCell.textContent = newSum.toLocaleString('ru-RU') + ' сум';
          }
        }
      });
    }
  });

  // Управление главным чекбоксом и состояния indeterminate
  function updateSelectAllState() {
    const visibleCheckboxes = Array.from(rowCheckboxes).filter(cb => cb.closest('tr').style.display !== 'none');
    if (visibleCheckboxes.length === 0) {
      if (selectAll) selectAll.checked = false;
      if (selectAll) selectAll.indeterminate = false;
      return;
    }

    const checkedCount = visibleCheckboxes.filter(cb => cb.checked).length;

    if (checkedCount === 0) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    } else if (checkedCount === visibleCheckboxes.length) {
      selectAll.checked = true;
      selectAll.indeterminate = false;
    } else {
      selectAll.checked = false;
      selectAll.indeterminate = true;
    }
  }

  if (selectAll) {
    selectAll.addEventListener('change', () => {
      rowCheckboxes.forEach(cb => {
        const row = cb.closest('tr');
        if (row && row.style.display !== 'none') {
          cb.checked = selectAll.checked;
        }
      });
      selectAll.indeterminate = false;
    });
  }

  rowCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateSelectAllState);
  });

  // Переключение пагинации
  const pageButtons = document.querySelectorAll('.page-btn');
  pageButtons.forEach(btn => {
    if (!['Назад', 'Вперёд'].includes(btn.textContent)) {
      btn.addEventListener('click', () => {
        pageButtons.forEach(b => {
          if (!['Назад', 'Вперёд'].includes(b.textContent)) {
            b.classList.remove('active');
          }
        });
        btn.classList.add('active');
      });
    }
  });

});