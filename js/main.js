/**
 * @author Victor Taran <tarvics@gmail.com>
 */

/**
 * Клас реалізації заголовку об'єкта "To do list"
 * @class {Object} ToDoListHeader
 */
class ToDoListHeader {

    #onAppendTask;

    /**
     * Ініціалізація елементів
     * @param {HTMLElement?} root Батьківський елемент
     */
    #initElements(root) {
        this.inputNew = root.querySelector('.task-add input[type="text"]');
        this.iconAdd = root.querySelector('.icon-add');
    }

    /**
     * Ініціалізація обробників подій елементів
     * @param {HTMLElement?} root Батьківський елемент
     */
    #initEvents(root) {
        this.inputNew.addEventListener('input', e => {
            this.iconAdd.classList[e.target.value ? 'remove' : 'add']('disabled')
        });
        this.inputNew.addEventListener('keydown', e => (e.key === 'Enter') && this.appendTask());

        this.iconAdd.addEventListener('click', () => this.appendTask());
    }

    /**
     * Ініціалізація екземпляра класу
     * @param {HTMLElement?} root Батьківський елемент
     */
    #init(root) {
        this.#onAppendTask = null;
    }

    /**
     * Додавання нового запису "to do", текст який було введено користувачем
     */
    appendTask() {
        if (this.iconAdd.classList.contains('disabled')) return;

        if (this.#onAppendTask) this.#onAppendTask(this.inputNew.value);

        this.inputNew.value = '';
        this.iconAdd.classList.add('disabled');
    }

    /**
     * Конструктор класу ToDoListHeader
     * @param {HTMLElement?} root Батьківський елемент
     */
    constructor(root = document.body) {
        this.#initElements(root);
        this.#initEvents(root);
        this.#init(root);
    }

    /**
     * Callback функція, яка виконується під час додавання нового запису списку "to do list"
     * @callback AppendTaskCallback
     * @param {string} text Текст запису списку "to do list"
     */

    /**
     * Обробник додавання нового запису до списку "to do list"
     * @param {AppendTaskCallback} fnAppendTask Посилання на функцію callback обробника нового запису
     */
    set onAppendTask(fnAppendTask) {
        if (typeof fnAppendTask === 'function') {
            this.#onAppendTask = fnAppendTask;
        }
    }
}

/**
 * Клас реалізації елементів контролю об'єкта "To do list"
 * @class {Object} ToDoListControls
 */
class ToDoListControls {
    #onEditModeChange;
    #onActiveTabChange;

    /**
     * Ініціалізація елементів
     * @param {HTMLElement?} root Батьківський елемент
     */
    #initElements(root) {
        this.tabs = root.querySelector('.task-tabs');
        this.slider = root.querySelector('.task-slider');
        this.iconEdit = root.querySelector('.icon-edit');
    }

    /**
     * Ініціалізація обробників подій елементів
     * @param {HTMLElement?} root Батьківський елемент
     */
    #initEvents(root) {
        this.iconEdit.addEventListener('click', () => {
            this.iconEdit.classList.toggle('active');
            if (this.#onEditModeChange) this.#onEditModeChange(this.iconEdit.classList.contains('active'));
        });

        this.tabs.addEventListener('click', e => {
            [].forEach.call(this.tabs.children, tab => tab.classList.remove('active'));

            const target = e.target.tagName === 'DIV' ? e.target : e.target.parentNode;
            target.classList.add('active');
            this.#syncSlider(target);

            if (this.#onActiveTabChange) this.#onActiveTabChange(target);
        });
    }

    /**
     * Ініціалізація екземпляра класу
     * @param {HTMLElement?} root Батьківський елемент
     */
    #init(root) {
        this.#onActiveTabChange = null;
        this.#onEditModeChange = null;

        this.#syncSlider(this.tabs.children[0]);

        this.tabsObserver = new ResizeObserver(() => {
            [].forEach.call(this.tabs.children,tab =>
                tab.classList.contains('active') && this.#syncSlider(tab));
        });

        [].forEach.call(this.tabs.children, tab => this.tabsObserver.observe(tab));
    }

    /**
     * Синхронізація положення та розміру слайдера під вкладкою після зміни розміру чи активації вкладки
     * @param {HTMLElement} tab
     */
    #syncSlider(tab) {
        const rect0 = this.tabs.children[0].getBoundingClientRect();
        const rect1 = tab.getBoundingClientRect();

        this.slider.style.left = (rect1.left - rect0.left) + 'px';
        this.slider.style.width = rect1.width + 'px';
    }

    /**
     * Зміна значення лічильника кількості записів списку при зміні стану завдання та після операцій створення чи видалення
     * @param {HTMLElement} tab Вкладка, яка містить лічильник кількості записів
     * @param {number} value Значення, яке додається до лічильника
     */
    #incBadge(tab, value) {
        const badge = tab.children[0];
        const count = (+badge.dataset.value || 0) + value;
        badge.dataset.value = count.toString();
        badge.textContent = count.toString();
    }

    /**
     * Встановлення значення лічильника кількості записів списку при зміні стану завдання та після операцій створення чи видалення
     * @param {HTMLElement} tab Вкладка, яка містить лічильник кількості записів
     * @param {number} value Значення, яке встановлюється до лічильника
     */
    #setBadge(tab, value) {
        const badge = tab.children[0];
        badge.dataset.value = value.toString();
        badge.textContent = value.toString();
    }

    /**
     * Конструктор класу ToDoListControls
     * @param {HTMLElement?} root Батьківський елемент
     */
    constructor(root = document.body) {
        this.#initElements(root);
        this.#initEvents(root);
        this.#init(root);
    }

    /**
     * Інформація для зміни значень лічильників завдань,
     * використовується в {@link incBadgeValue} та в {@link setBadgeValue}
     * @typedef {Object} MovePageInfo
     * @property {number} pageIndex Індекс вкладки, на якій розміщений лічильник
     * @property {number} value Значення, на яке змінюється лічильник
     */

    /**
     * Зміна значень лічильників завдань
     * @param {MovePageInfo[]} pageInfo Інформація для зміни значень лічильників завдань
     */
    incBadgeValue(pageInfo = []) {
        pageInfo.forEach(info => this.#incBadge(this.tabs.children[info.pageIndex], info.value));
    }

    /**
     * Встановлення значень лічильників завдань
     * @param {MovePageInfo[]} pageInfo Інформація для встановлення значень лічильників завдань
     */
    setBadgeValue(pageInfo = []) {
        pageInfo.forEach(info => this.#setBadge(this.tabs.children[info.pageIndex], info.value));
    }

    /**
     * Callback функція, яка виконується під час активації нової вкладки
     * @callback ActiveTabChange
     * @param {HTMLElement} tab Елемент активної вкладки
     */

    /**
     * Callback функція, яка виконується під час активації нової вкладки
     * @param {ActiveTabChange} fnActiveTabChange Посилання на функцію callback обробника активації нової вкладки
     */
    set onActiveTabChange(fnActiveTabChange) {
        if (typeof fnActiveTabChange === 'function') {
            this.#onActiveTabChange = fnActiveTabChange;
        }
    }

    /**
     * Callback функція, яка виконується під час зміни режиму редагування списку "to do list"
     * @callback EditModeChangeCallback
     * @param {boolean} edit Ознака того, що включений режим редагування списку "to do list"
     */

    /**
     * Обробник зміни режиму редагування списку "to do list"
     * @param {EditModeChangeCallback} fnEditModeChange Посилання на функцію callback обробника зміни режиму редагування
     */
    set onEditModeChange(fnEditModeChange) {
        if (typeof fnEditModeChange === 'function') {
            this.#onEditModeChange = fnEditModeChange;
        }
    }
}

/**
 * Клас реалізації "To do list"
 * @class {Object} ToDoList
 */
class ToDoList {

    #storage;
    #saveTimer;

    /**
     * Ініціалізація елементів
     * @param {HTMLElement?} root Батьківський елемент
     */
    #initElements(root) {
        this.taskList = root.querySelector('.task-list');

        this.inputNode = document.createElement('input');
        this.inputNode.type = 'text';
    }

    /**
     * Ініціалізація обробників подій елементів
     * @param {HTMLElement?} root Батьківський елемент
     */
    #initEvents(root) {
        this.taskList.addEventListener('click', e => {
            this.fnCheckTask(e) || this.fnDeleteTask(e) || this.fnModifyTask(e);
        });

        this.inputNode.addEventListener('change', e => {
            const labelNode = e.target.previousElementSibling;
            const taskText = labelNode.querySelector('.task-text');
            taskText.textContent = e.target.value;
            this.save();
        });

        this.inputNode.addEventListener('blur', e => {
            const labelNode = e.target.previousElementSibling;
            const taskText = labelNode.querySelector('.task-text');
            taskText.style.display = 'block';
            e.target.style.display = 'none';
        });

        this.inputNode.addEventListener('keydown', e => {
            if (e.key === 'Enter') e.target.blur();
        });
    }

    /**
     * Ініціалізація екземпляра класу
     * @param {HTMLElement?} root Батьківський елемент
     */
    #init(root) {
        this.#storage = '';
        this.#saveTimer = null;

        this.header = new ToDoListHeader(root);
        this.header.onAppendTask = this.fnAppendTask.bind(this);

        this.controls = new ToDoListControls(root);
        this.controls.onEditModeChange = edit => this.taskList.dataset.edit = (+edit).toString();
        this.controls.onActiveTabChange = tab => this.taskList.dataset.filter = tab.id;
    }

    /**
     * Створення нового запису із текстом "to do"
     * @param {string} text Текст повідомлення
     * @param {string?} id ID елемента
     * @param {string?} type Тип повідомлення
     */
    #createTask(text, id, type = 'todo') {
        if(!id) {
            const lastChild = this.taskList.lastElementChild;
            id = lastChild ? String(+lastChild.id + 1) : '1';
        }

        const newTask = document.createElement('li');
        newTask.id = id;
        newTask.className = 'task';
        newTask.dataset.type = type;

        const label = document.createElement('label');

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = type === 'done';

        const ckSpan = document.createElement('span');

        const taskSpan = document.createElement('span');
        taskSpan.className = 'task-text';
        taskSpan.textContent = text;

        label.append(input, ckSpan, taskSpan);

        const iconSpan = document.createElement('span');
        iconSpan.className = 'icon-delete';

        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fa-regular fa-trash-can';

        iconSpan.appendChild(deleteIcon);

        newTask.append(label, iconSpan);

        this.taskList.appendChild(newTask);
    }

    /**
     * Обробник події зміни значення стану елемента "checkbox"
     * @param {Event} e Подія зміни значення стану елемента "checkbox"
     * @returns {boolean} Повертає true у випадку, якщо подія була успішно оброблена
     */
    fnCheckTask(e) {
        const result = e.target.tagName === 'INPUT' || e.target.type === 'checkbox';
        if (result) {
            const task = e.target.closest('li');
            task.dataset.type = e.target.checked ? 'done' : 'todo';

            if (e.target.checked) {
                this.controls.incBadgeValue([
                    {pageIndex: 1, value: -1},
                    {pageIndex: 2, value: 1}
                ]);
            } else {
                this.controls.incBadgeValue([
                    {pageIndex: 2, value: -1},
                    {pageIndex: 1, value: 1}
                ]);
            }

            this.save();
        }
        return result;
    }

    /**
     * Обробник події видалення запису
     * @param {Event} e Подія, яка виникла при натисканні на елемент із класом "icon-delete"
     * @returns {boolean} Повертає true у випадку, якщо подія була успішно оброблена
     */
    fnDeleteTask(e) {
        const parent = e.target.parentNode;
        const result = parent && parent.classList.contains('icon-delete');
        if (result) {
            const task = e.target.closest('li');

            this.controls.incBadgeValue([
                {pageIndex: 0, value: -1},
                {pageIndex: task.dataset.type === 'done' ? 2 : 1, value: -1}
            ]);

            task.remove();

            this.save();
        }

        return result;
    }

    /**
     * Обробник події редагування тексту запису
     * @param {Event} e Подія, яка виникла при натисканні на елемент із класом "task-text"
     * @returns {boolean} Повертає true у випадку, якщо подія була успішно оброблена
     */
    fnModifyTask(e) {
        const result = +this.taskList.dataset.edit && e.target.classList.contains('task-text');
        if (result) {
            const taskText = e.target;
            const labelNode = taskText.parentNode;

            this.inputNode.value = taskText.textContent;
            this.inputNode.style.display = 'inline-block';

            taskText.style.display = 'none';
            labelNode.after(this.inputNode);

            this.inputNode.focus();

            e.preventDefault();
        }

        return result;
    }

    /**
     * Додавання нового запису до елемента "task-list"
     * @param {string} taskText Текст запису
     */
    fnAppendTask(taskText) {
        this.#createTask(taskText);

        this.controls.incBadgeValue([
            {pageIndex: 0, value: 1},
            {pageIndex: 1, value: 1}
        ]);

/*
        const scrollHeight = Math.max(
            document.body.scrollHeight, /!*document.documentElement.scrollHeight,*!/
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );

        this.taskList.style.maxHeight = (scrollHeight - this.taskList.getBoundingClientRect().top) + 'px';
*/

        const docBounding = document.body.getBoundingClientRect();
        if (docBounding.width >= 500) {
            this.taskList.style.maxHeight = (docBounding.bottom - this.taskList.getBoundingClientRect().top) + 'px';
        }

        this.save();
    }

    /**
     * Конструктор класу ToDoList
     * @param {HTMLElement?} root Батьківський елемент
     */
    constructor(root = document.body) {
        this.#initElements(root);
        this.#initEvents(root);
        this.#init(root);
    }

    /**
     * Збереження списку повідомлень до локального сховища даних.
     * Для того, щоб відбувся експорт, необхідно спочатку завантажити цей список за допомогою {@link load},
     * відповідно, вказавши назву сховища. Ця назва сховища буде використовуватись надалі для збереження.
     */
    save() {
        if (!this.#storage) return;

        if (this.#saveTimer) {
            clearTimeout(this.#saveTimer);
            this.#saveTimer = null;
        }

        this.#saveTimer = setTimeout(() => {
            const tasks = [].map.call(this.taskList.children, task => ({
                id: task.id,
                type: task.dataset.type,
                text: task.firstElementChild/*label*/.lastElementChild/*span*/.textContent
            }));

            localStorage.setItem(this.#storage, JSON.stringify(tasks));
        }, 500);
    }

    /**
     * Завантаження списку повідомлень з локального сховища даних.
     * @param {string} storage Назва сховища, яка буде використовуватись в операціях запису/читання сховища повідомлень
     */
    load(storage) {
        if (!storage) return;
        this.#storage = storage;

        const data = localStorage.getItem(this.#storage);
        if (!data) return;

        const tasks = JSON.parse(data);
        if (!Array.isArray(tasks)) return;

        this.taskList.textContent = '';
        let todoCount = 0;
        let doneCount = 0;

        tasks.forEach(task => {
            if (task.type === 'todo') {
                todoCount++;
            } else if (task.type === 'done') {
                doneCount++;
            }
            this.#createTask(task.text, task.id, task.type);
        });

        this.controls.setBadgeValue([
            {pageIndex: 0, value: tasks.length},
            {pageIndex: 1, value: todoCount},
            {pageIndex: 2, value: doneCount}
        ])

/*

        const scrollHeight = Math.max(
            document.body.scrollHeight, /!*document.documentElement.scrollHeight,*!/
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );

        this.taskList.style.maxHeight = (scrollHeight /!*- this.taskList.getBoundingClientRect().top*!/) + 'px';
*/
        const docBounding = document.body.getBoundingClientRect();
        if (docBounding.width >= 500) {
            this.taskList.style.maxHeight = (docBounding.bottom - this.taskList.getBoundingClientRect().top) + 'px';
        }
    }
}

const root = document.getElementById('root');
const todoList = new ToDoList(root);
todoList.load('TODO');
