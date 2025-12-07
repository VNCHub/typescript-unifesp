"use strict";
(() => {
  // src/frontend/HomeFrontend.ts
  var HomeFrontend = class {
    constructor() {
      this.API = "/api/subjects";
    }
    init() {
      this.loadAndRender();
      document.addEventListener("click", (e) => {
        const target = e.target;
        if (target?.dataset?.edit?.endsWith("-details")) {
          const id = Number(target.dataset.edit.replace("-details", ""));
          this.openDetailsModal(id);
        }
      });
    }
    async openDetailsModal(id) {
      const res = await fetch(`${this.API}/${id}`);
      const subject = await res.json();
      this.$("#detail-nome").textContent = subject.nome;
      this.$("#detail-descricao").textContent = subject.descricao ?? "\u2014";
      this.$("#detail-professor").textContent = subject.professor?.nome ?? "\u2014";
      this.$("#detail-horario").textContent = subject.horario ?? "\u2014";
      this.$("#detail-sala").textContent = subject.sala ?? "\u2014";
      this.loadNotes(id);
      const modal = new bootstrap.Modal(this.$("#subjectDetailsModal"));
      modal.show();
    }
    async loadNotes(subjectId) {
      const list = this.$("#notes-list");
      list.innerHTML = `
      <li class="list-group-item text-center text-muted" id="notes-loading">
        <div class="spinner-border spinner-border-sm me-2"></div>
        Carregando notas...
      </li>
    `;
      const res = await fetch(`/api/subjects/${subjectId}/notes`);
      const notes = await res.json();
      list.innerHTML = "";
      if (!notes.length) {
        list.innerHTML = `
        <li class="list-group-item text-center text-muted">
          Nenhuma nota ainda.
        </li>
      `;
        return;
      }
      for (const n of notes) {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
        <span>${this.escapeHtml(n.texto)}</span>
        <div>
          <button class="btn btn-sm btn-outline-secondary me-1" data-edit-note="${n.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-delete-note="${n.id}">Excluir</button>
        </div>
      `;
        list.appendChild(li);
      }
    }
    $(sel) {
      return document.querySelector(sel);
    }
    escapeHtml(s = "") {
      return String(s).replace(
        /[&<>"']/g,
        (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]
      );
    }
    async fetchSubjects() {
      const res = await fetch(this.API);
      if (!res.ok) throw new Error("Erro ao carregar mat\xE9rias");
      return res.json();
    }
    renderList(items) {
      const container = this.$("#subject-list");
      container.innerHTML = "";
      if (!items.length) {
        container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info">Nenhuma mat\xE9ria cadastrada ainda.</div>
        </div>`;
        return;
      }
      for (const s of items) {
        const col = document.createElement("div");
        col.className = "col-md-4 mb-3";
        col.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${this.escapeHtml(s.nome)}</h5>
            <p class="card-text">${this.escapeHtml(s.descricao || "")}</p>
            <p class="small text-muted">Professor: ${this.escapeHtml(s.professor?.nome ?? "\u2014")}</p>
            <p class="text-muted small">
              ${this.escapeHtml(
          s.horario ? s.horario + (s.sala ? " \u2022 Sala " + s.sala : "") : s.sala ? "Sala " + s.sala : ""
        )}
            </p>
            <button class="btn btn-sm btn-outline-primary me-2" data-edit="${s.id}-details">Detalhes</button>
          </div>
        </div>`;
        container.appendChild(col);
      }
    }
    async loadAndRender() {
      try {
        const subjects = await this.fetchSubjects();
        this.renderList(subjects);
      } catch (err) {
        const container = this.$("#subject-list");
        container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">Erro ao carregar mat\xE9rias.</div>
        </div>`;
      }
    }
  };
})();
//# sourceMappingURL=HomeFrontend.js.map
