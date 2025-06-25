if (!document.getElementById('lotus-flower-overlay')) {
  const container = document.createElement('div');
  container.id = 'lotus-flower-overlay';
  container.innerHTML = `
    <div class="flower-floating">
      <div class="petal"></div>
      <div class="petal"></div>
      <div class="petal"></div>
      <div class="petal"></div>
    </div>
  `;
  document.body.appendChild(container);
}
