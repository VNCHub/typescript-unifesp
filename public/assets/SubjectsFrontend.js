"use strict";
(() => {
  // src/frontend/SubjectsFrontend.ts
  var SubjectsFrontend = class {
    constructor() {
      this.API = "/api/subjects";
      this.modal = null;
      this.deleteModal = null;
      this.editingId = null;
      this.deleteId = null;
      this.tableBody = document.getElementById("subjects-table-body");
    }
    init() {
      if (!this.tableBody) return;
      this.initModals();
      this.bindEvents();
      this.loadAndRender();
    }
    $(sel) {
      return document.querySelector(sel);
    }
    initModals() {
      const modalEl = document.getElementById("subjectModal");
      this.modal = modalEl ? new bootstrap.Modal(modalEl) : null;
      const delEl = document.getElementById("confirmDeleteModal");
      this.deleteModal = delEl ? new bootstrap.Modal(delEl) : null;
    }
    bindEvents() {
      this.$("#btn-new-subject")?.addEventListener("click", () => this.openCreate());
      const form = document.getElementById("subject-form");
      form?.addEventListener("submit", (e) => this.onFormSubmit(e));
      this.$("#btn-confirm-delete")?.addEventListener("click", () => this.confirmDelete());
    }
    showMsg(msg, type = "info") {
      const main = document.querySelector("main") || document.body;
      const div = document.createElement("div");
      div.className = `alert alert-${type} alert-dismissible fade show`;
      div.innerHTML = `
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
      main.prepend(div);
      setTimeout(() => div.remove(), 4e3);
    }
    async fetchSubjects() {
      const res = await fetch(this.API);
      if (!res.ok) throw new Error("Erro ao carregar mat\xE9rias.");
      return res.json();
    }
    async fetchProfessores() {
      const res = await fetch("/api/professors");
      if (!res.ok) throw new Error("Erro ao carregar professores");
      return res.json();
    }
    async loadProfessoresSelect(selectedId = null) {
      const select = document.getElementById("input-professorId");
      if (!select) return;
      select.innerHTML = `<option value="">Selecione um professor...</option>`;
      try {
        const profs = await this.fetchProfessores();
        profs.forEach((p) => {
          const opt = document.createElement("option");
          opt.value = String(p.id);
          opt.textContent = `${p.nome}`;
          if (selectedId && selectedId === p.id) opt.selected = true;
          select.appendChild(opt);
        });
      } catch {
        this.showMsg("Erro ao carregar lista de professores.", "danger");
      }
    }
    async loadAndRender() {
      if (!this.tableBody) return;
      try {
        const data = await this.fetchSubjects();
        this.renderTable(data);
      } catch (err) {
        this.tableBody.innerHTML = `
        <tr><td colspan="6" class="text-danger text-center">Erro ao carregar.</td></tr>
      `;
      }
    }
    renderTable(items) {
      if (!this.tableBody) return;
      if (!items.length) {
        this.tableBody.innerHTML = `
        <tr><td colspan="6" class="text-center text-muted">Nenhuma mat\xE9ria cadastrada.</td></tr>
      `;
        return;
      }
      this.tableBody.innerHTML = items.map((s) => {
        return `
        <tr>
          <td>${s.id}</td>
          <td>${this.escape(s.nome)}</td>
          <td>${this.escape(s.professor?.nome ?? "\u2014")}</td>
          <td>${this.escape(s.horario ?? "\u2014")}</td>
          <td>${this.escape(s.sala ?? "\u2014")}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" data-edit="${s.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-delete="${s.id}" data-name="${this.escape(s.nome)}">Excluir</button>
          </td>
        </tr>
      `;
      }).join("");
      this.tableBody.querySelectorAll("[data-edit]").forEach(
        (btn) => btn.addEventListener("click", (e) => this.onEdit(e))
      );
      this.tableBody.querySelectorAll("[data-delete]").forEach(
        (btn) => btn.addEventListener("click", (e) => this.onAskDelete(e))
      );
    }
    escape(s = "") {
      return String(s).replace(/[&<>"']/g, (m) => {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
      });
    }
    openCreate() {
      this.editingId = null;
      document.getElementById("subject-form").reset();
      this.$("#modalTitle").textContent = "Nova mat\xE9ria";
      this.loadProfessoresSelect(null);
      this.modal?.show();
    }
    async onEdit(e) {
      const id = Number(e.currentTarget.dataset.edit);
      if (!id) return;
      try {
        const res = await fetch(`${this.API}/${id}`);
        const item = await res.json();
        this.editingId = item.id;
        document.getElementById("input-id").value = item.id;
        document.getElementById("input-nome").value = item.nome;
        document.getElementById("input-descricao").value = item.descricao ?? "";
        await this.loadProfessoresSelect(item.professorId);
        document.getElementById("input-horario").value = item.horario ?? "";
        document.getElementById("input-sala").value = item.sala ?? "";
        this.$("#modalTitle").textContent = "Editar mat\xE9ria";
        this.modal?.show();
      } catch {
        this.showMsg("Erro ao carregar mat\xE9ria.", "danger");
      }
    }
    async onFormSubmit(e) {
      e.preventDefault();
      const payload = {
        nome: document.getElementById("input-nome").value.trim(),
        descricao: document.getElementById("input-descricao").value.trim() || null,
        professorId: Number(document.getElementById("input-professorId").value.trim()),
        horario: document.getElementById("input-horario").value.trim() || null,
        sala: document.getElementById("input-sala").value.trim() || null
      };
      const url = this.editingId ? `${this.API}/${this.editingId}` : this.API;
      const method = this.editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return this.showMsg("Erro ao salvar mat\xE9ria.", "danger");
      this.modal?.hide();
      this.showMsg(this.editingId ? "Mat\xE9ria atualizada!" : "Mat\xE9ria criada!", "success");
      this.loadAndRender();
    }
    onAskDelete(e) {
      const btn = e.currentTarget;
      this.deleteId = Number(btn.dataset.delete);
      const name = btn.dataset.name;
      this.$("#delete-item-name").textContent = name ?? "";
      this.deleteModal?.show();
    }
    async confirmDelete() {
      if (!this.deleteId) return;
      const res = await fetch(`${this.API}/${this.deleteId}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        this.showMsg("Erro ao excluir mat\xE9ria.", "danger");
        return;
      }
      this.deleteModal?.hide();
      this.showMsg("Mat\xE9ria exclu\xEDda.", "success");
      this.loadAndRender();
    }
  };
})();
//# sourceMappingURL=SubjectsFrontend.js.map
