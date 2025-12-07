export class SubjectsFrontend {
  private API = "/api/subjects";
  private tableBody: HTMLElement | null;
  private modal: any = null;
  private deleteModal: any = null;
  private editingId: number | null = null;
  private deleteId: number | null = null;

  constructor() {
    this.tableBody = document.getElementById("subjects-table-body");
  }

  init() {
    if (!this.tableBody) return;

    this.initModals();
    this.bindEvents();
    this.loadAndRender();
  }

  private $(sel: string) {
    return document.querySelector(sel) as HTMLElement | null;
  }

  private initModals() {
    const modalEl = document.getElementById("subjectModal");
    // @ts-ignore
    this.modal = modalEl ? new bootstrap.Modal(modalEl) : null;

    const delEl = document.getElementById("confirmDeleteModal");
    // @ts-ignore
    this.deleteModal = delEl ? new bootstrap.Modal(delEl) : null;
  }

  private bindEvents() {
    this.$("#btn-new-subject")?.addEventListener("click", () => this.openCreate());

    const form = document.getElementById("subject-form") as HTMLFormElement | null;
    form?.addEventListener("submit", (e) => this.onFormSubmit(e));

    this.$("#btn-confirm-delete")?.addEventListener("click", () => this.confirmDelete());
  }

  private showMsg(msg: string, type: "success" | "danger" | "info" = "info") {
    const main = document.querySelector("main") || document.body;
    const div = document.createElement("div");

    div.className = `alert alert-${type} alert-dismissible fade show`;
    div.innerHTML = `
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    main.prepend(div);
    setTimeout(() => div.remove(), 4000);
  }

  private async fetchSubjects() {
    const res = await fetch(this.API);
    if (!res.ok) throw new Error("Erro ao carregar matérias.");
    return res.json();
  }

  private async fetchProfessores() {
  const res = await fetch("/api/professors");
  if (!res.ok) throw new Error("Erro ao carregar professores");
  return res.json();
  }

  private async loadProfessoresSelect(selectedId: number | null = null) {
    const select = document.getElementById("input-professorId") as HTMLSelectElement;
    if (!select) return;

    // limpa antes
    select.innerHTML = `<option value="">Selecione um professor...</option>`;

    try {
      const profs = await this.fetchProfessores();

      profs.forEach((p: any) => {
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

  private async loadAndRender() {
    if (!this.tableBody) return;

    try {
      const data = await this.fetchSubjects();
      this.renderTable(data);
    } catch (err: any) {
      this.tableBody.innerHTML = `
        <tr><td colspan="6" class="text-danger text-center">Erro ao carregar.</td></tr>
      `;
    }
  }

  private renderTable(items: any[]) {
    if (!this.tableBody) return;

    if (!items.length) {
      this.tableBody.innerHTML = `
        <tr><td colspan="6" class="text-center text-muted">Nenhuma matéria cadastrada.</td></tr>
      `;
      return;
    }

    this.tableBody.innerHTML = items
      .map((s) => {
        return `
        <tr>
          <td>${s.id}</td>
          <td>${this.escape(s.nome)}</td>
          <td>${this.escape(s.professor?.nome ?? "—")}</td>
          <td>${this.escape(s.horario ?? "—")}</td>
          <td>${this.escape(s.sala ?? "—")}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" data-edit="${s.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-delete="${s.id}" data-name="${this.escape(s.nome)}">Excluir</button>
          </td>
        </tr>
      `;
      })
      .join("");

    // bind edit/delete buttons
    this.tableBody.querySelectorAll("[data-edit]").forEach((btn) =>
      btn.addEventListener("click", (e) => this.onEdit(e))
    );

    this.tableBody.querySelectorAll("[data-delete]").forEach((btn) =>
      btn.addEventListener("click", (e) => this.onAskDelete(e))
    );
  }

  private escape(s = "") {
    return String(s).replace(/[&<>"']/g, (m) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!;
    });
  }

  private openCreate() {
    this.editingId = null;

    (document.getElementById("subject-form") as HTMLFormElement).reset();
    this.$("#modalTitle")!.textContent = "Nova matéria";
    this.loadProfessoresSelect(null);

    this.modal?.show();
  }

  private async onEdit(e: Event) {
    const id = Number((e.currentTarget as HTMLElement).dataset.edit);
    if (!id) return;

    try {
      const res = await fetch(`${this.API}/${id}`);
      const item = await res.json();

      this.editingId = item.id;

      (document.getElementById("input-id") as HTMLInputElement).value = item.id;
      (document.getElementById("input-nome") as HTMLInputElement).value = item.nome;
      (document.getElementById("input-descricao") as HTMLTextAreaElement).value = item.descricao ?? "";
      await this.loadProfessoresSelect(item.professorId);
      (document.getElementById("input-horario") as HTMLInputElement).value = item.horario ?? "";
      (document.getElementById("input-sala") as HTMLInputElement).value = item.sala ?? "";

      this.$("#modalTitle")!.textContent = "Editar matéria";
      this.modal?.show();
    } catch {
      this.showMsg("Erro ao carregar matéria.", "danger");
    }
  }

  private async onFormSubmit(e: Event) {
    e.preventDefault();

    const payload = {
      nome: (document.getElementById("input-nome") as HTMLInputElement).value.trim(),
      descricao: (document.getElementById("input-descricao") as HTMLTextAreaElement).value.trim() || null,
      professorId: Number((document.getElementById("input-professorId") as HTMLInputElement).value.trim()),
      horario: (document.getElementById("input-horario") as HTMLInputElement).value.trim() || null,
      sala: (document.getElementById("input-sala") as HTMLInputElement).value.trim() || null,
    };

    const url = this.editingId ? `${this.API}/${this.editingId}` : this.API;
    const method = this.editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return this.showMsg("Erro ao salvar matéria.", "danger");

    this.modal?.hide();
    this.showMsg(this.editingId ? "Matéria atualizada!" : "Matéria criada!", "success");

    this.loadAndRender();
  }

  private onAskDelete(e: Event) {
    const btn = e.currentTarget as HTMLElement;

    this.deleteId = Number(btn.dataset.delete);
    const name = btn.dataset.name;

    this.$("#delete-item-name")!.textContent = name ?? "";
    this.deleteModal?.show();
  }

  private async confirmDelete() {
    if (!this.deleteId) return;

    const res = await fetch(`${this.API}/${this.deleteId}`, { method: "DELETE" });

    if (!res.ok && res.status !== 204) {
      this.showMsg("Erro ao excluir matéria.", "danger");
      return;
    }

    this.deleteModal?.hide();
    this.showMsg("Matéria excluída.", "success");

    this.loadAndRender();
  }
}
