/**
 * @author Victor Taran <tarvics@gmail.com>
 */

/**
 * Callback для задання параметрів елемента за допомогою функції {@link makeTag}
 * @callback fnParamsCallback
 * @param {HTMLElement} element Елемент, якому потрібно вказати параметри
 */

/**
 * Додаткова інформація, яка використовується під час створення тегу функцією {@link makeTag}
 * @typedef {Object} TagInfo
 * @property {string?} className назва класу, із пробілами в ролі роздільників, у випадку, якщо кілька класів
 * @property {string?} id ID тегу
 * @property {string?} innerHTML innerHTML значення тегу
 * @property {string?} innerText innerText значення тегу. Якщо, цей атрибут заданий, то значення атрибуту html - буде ігноруватись
 * @property {string?} tagName назва тегу
 * @property {string?} textContent textContent значення тегу
 */

/**
 * Створення вкладених тегів
 * @param {string|TagInfo} tag Назва тегу або об'єкт із додатковою інформацією про тег
 * @param {fnParamsCallback|HTMLElement} fnParams Callback функція для задання параметрів елемента
 * У випадку, якщо функція не задана, то даний параметр буде вважатись дочірнім елементом, який додається
 * до поточного елемента
 * @param {...HTMLElement} children Дочірні елементи, які будуть додані до поточного елемента
 * @returns {HTMLElement}
 */
const makeTag = function (tag, fnParams = undefined, ...children) {
    let res;

    if (typeof tag === 'object') {
        res = document.createElement(tag.tagName || 'div');
        if (tag.id) res.id = tag.id;
        if (tag.className) res.className = tag.className;
        if (tag.textContent) {
            res.textContent = tag.textContent;
        } else if (tag.innerText) {
            res.innerText = tag.innerText;
        } else if (tag.innerHTML) {
            res.innerHTML = tag.innerHTML;
        }
    } else {
        res = document.createElement(tag);
    }

    if (typeof fnParams === 'function') {
        fnParams(res);
        if (children.length) res.append(...children);
    } else if (fnParams) {
        res.append(fnParams, ...children);
    } else {
        res.append(...children);
    }

    return res;
}

/********************************************************************/

/*

const iconAdd = document.querySelector('.icon-add');
const inputNew = document.querySelector('.task-add input[type="text"]');
const iconEdit = document.querySelector('.icon-edit');
const tabs = document.querySelector('.task-tabs');
const taskList = document.querySelector('.task-list');
const slider = document.querySelector('.task-slider');

let inputNode = null;

const rect0 = tabs.children[0].getBoundingClientRect();
slider.style.left = rect0.left + 'px';
slider.style.width = rect0.width + 'px';

const tabsObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        if (entry.target.classList.contains('active')) {

            const rect0 = tabs.children[0].getBoundingClientRect();
            const rect1 = entry.target.getBoundingClientRect();

            slider.style.left = (rect1.left - rect0.left) + 'px';
            slider.style.width = rect1.width + 'px';
            break;
        }
    }
});

[].forEach.call(tabs.children, tab => tabsObserver.observe(tab));

const appendTask = () => {
    if (iconAdd.classList.contains('disabled')) return;

    const lastChild = taskList.lastElementChild;
    const id = lastChild ? String(+lastChild.id + 1) : '1';

    const newTask = makeTag({tagName: 'li', id, className: "task" }, el => { el.dataset.type = 'to-do' },
        makeTag('label',
            makeTag('input', el => { el.type = 'checkbox' }), makeTag('span'),
            makeTag({ tagName: 'span', className: 'task-text', textContent: inputNew.value })
        ),
        makeTag({ tagName: 'span', className: 'icon-delete' },
            makeTag({ tagName: 'i', className: 'fa-regular fa-trash-can' } )
        )
    );

    taskList.appendChild(newTask);
    inputNew.value = '';
    iconAdd.classList.add('disabled');

    let badge = tabs.children[0].children[0];
    let count = (+badge.dataset.value || 0) + 1;
    badge.dataset.value = count.toString();
    badge.textContent = count.toString();

    badge = tabs.children[1].children[0];
    count = (+badge.dataset.value || 0)  + 1;
    badge.dataset.value = count.toString();
    badge.textContent = count.toString();

    const scrollHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );

    taskList.style.maxHeight = (scrollHeight - taskList.getBoundingClientRect().top) + 'px';
}

inputNew.addEventListener('input', e => iconAdd.classList[e.target.value ? 'remove' : 'add']('disabled'));
inputNew.addEventListener('keydown', e => (e.key === 'Enter') && appendTask());

iconAdd.addEventListener('click', () => appendTask());

iconEdit.addEventListener('click', () => {
    iconEdit.classList.toggle('active');

    if (iconEdit.classList.contains('active')) {
        taskList.dataset.edit = '1';
    } else {
        delete taskList.dataset.edit;
    }
})

tabs.addEventListener('click', e => {
    [].forEach.call(tabs.children, tab => tab.classList.remove('active'));

    const target = e.target.tagName === 'DIV' ? e.target : e.target.parentNode;
    target.classList.add('active');

    const rect0 = tabs.children[0].getBoundingClientRect();
    const rect1 = target.getBoundingClientRect();

    slider.style.left = (rect1.left - rect0.left) + 'px';
    slider.style.width = rect1.width + 'px';

    taskList.dataset.filter = target.id;
})

taskList.addEventListener('click', e => {
    if (e.target.tagName === 'INPUT' || e.target.type === 'checkbox') {
        const task = e.target.closest('li');
        task.dataset.type = e.target.checked ? 'done' : 'to-do';

        if (e.target.checked) {
            let badge = tabs.children[1].children[0];
            let count = (+badge.dataset.value || 0) - 1;
            badge.dataset.value = count.toString();
            badge.textContent = count.toString();

            badge = tabs.children[2].children[0];
            count = (+badge.dataset.value || 0)  + 1;
            badge.dataset.value = count.toString();
            badge.textContent = count.toString();
        } else {
            let badge = tabs.children[1].children[0];
            let count = (+badge.dataset.value || 0) + 1;
            badge.dataset.value = count.toString();
            badge.textContent = count.toString();

            badge = tabs.children[2].children[0];
            count = (+badge.dataset.value || 0) - 1;
            badge.dataset.value = count.toString();
            badge.textContent = count.toString();
        }
    } else if (e.target.parentNode.classList.contains('icon-delete')) {
        const task = e.target.closest('li');

        let badge = tabs.children[0].children[0];
        let count = (+badge.dataset.value || 0) - 1;
        badge.dataset.value = count.toString();
        badge.textContent = count.toString();

        badge = tabs.children[task.dataset.type === 'done' ? 2 : 1].children[0];
        count = (+badge.dataset.value || 0) - 1;
        badge.dataset.value = count.toString();
        badge.textContent = count.toString();

        task.remove();
    } else if (taskList.dataset.edit && e.target.classList.contains('task-text')) {
        const taskText = e.target;
        const labelNode = taskText.parentNode;

        if (!inputNode) {
            inputNode = document.createElement('input');
            inputNode.type = 'text';
            inputNode.addEventListener('change', e => {
                const labelNode = e.target.previousElementSibling;
                const taskText = labelNode.querySelector('.task-text');
                taskText.textContent = e.target.value;
            });
            inputNode.addEventListener('blur', e => {
                const labelNode = e.target.previousElementSibling;
                const taskText = labelNode.querySelector('.task-text');
                taskText.style.display = 'block';
                e.target.style.display = 'none';
            });
            inputNode.addEventListener('keydown', e => {
                if (e.key === 'Enter') e.target.blur();
            });
        }
        inputNode.value = taskText.textContent;
        inputNode.style.display = 'inline-block';
        taskText.style.display = 'none';

        labelNode.after(inputNode);
        inputNode.focus();

        e.preventDefault();
    }
});

*/

class ToDoList {

    #initSelectors(root) {
        this.iconAdd = root.querySelector('.icon-add');
        this.inputNew = root.querySelector('.task-add input[type="text"]');
        this.iconEdit = root.querySelector('.icon-edit');
        this.tabs = root.querySelector('.task-tabs');
        this.taskList = root.querySelector('.task-list');
        this.slider = root.querySelector('.task-slider');
        this.inputNode = null;
    }

    #syncSlider(tab) {
        const rect0 = this.tabs.children[0].getBoundingClientRect();
        const rect1 = tab.getBoundingClientRect();

        this.slider.style.left = (rect1.left - rect0.left) + 'px';
        this.slider.style.width = rect1.width + 'px';
    }

    #incBadge(tab, value) {
        let badge = tab.children[0];
        let count = (+badge.dataset.value || 0) + value;
        badge.dataset.value = count.toString();
        badge.textContent = count.toString();
    }

    fnCheckTask(e) {
        const result = e.target.tagName === 'INPUT' || e.target.type === 'checkbox';
        if (result) {
            const task = e.target.closest('li');
            task.dataset.type = e.target.checked ? 'done' : 'to-do';

            if (e.target.checked) {
                this.#incBadge(this.tabs.children[1], -1);
                this.#incBadge(this.tabs.children[2], 1);
            } else {
                this.#incBadge(this.tabs.children[1], 1);
                this.#incBadge(this.tabs.children[2], -1);
            }
        }
        return result;
    }

    fnDeleteTask(e) {
        const parent = e.target.parentNode;
        const result = parent && parent.classList.contains('icon-delete');
        if (result) {
            const task = e.target.closest('li');

            this.#incBadge(this.tabs.children[0], -1);
            this.#incBadge(this.tabs.children[task.dataset.type === 'done' ? 2 : 1], -1);

            task.remove();
        }

        return result;
    }

    fnModifyTask(e) {
        const result = this.taskList.dataset.edit && e.target.classList.contains('task-text');
        if (result) {
            const taskText = e.target;
            const labelNode = taskText.parentNode;

            if (!this.inputNode) {
                this.inputNode = document.createElement('input');
                this.inputNode.type = 'text';
                this.inputNode.addEventListener('change', e => {
                    const labelNode = e.target.previousElementSibling;
                    const taskText = labelNode.querySelector('.task-text');
                    taskText.textContent = e.target.value;
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
            this.inputNode.value = taskText.textContent;
            this.inputNode.style.display = 'inline-block';

            taskText.style.display = 'none';
            labelNode.after(this.inputNode);

            this.inputNode.focus();

            e.preventDefault();
        }

        return result;
    }

    #initEvents() {
        this.inputNew.addEventListener('input', e => {
            this.iconAdd.classList[e.target.value ? 'remove' : 'add']('disabled')
        });
        this.inputNew.addEventListener('keydown', e => (e.key === 'Enter') && this.fnAppendTask());

        this.iconAdd.addEventListener('click', () => this.fnAppendTask());

        this.iconEdit.addEventListener('click', () => {
            this.iconEdit.classList.toggle('active');

            if (this.iconEdit.classList.contains('active')) {
                this.taskList.dataset.edit = '1';
            } else {
                delete this.taskList.dataset.edit;
            }
        })

        this.tabs.addEventListener('click', e => {
            [].forEach.call(this.tabs.children, tab => tab.classList.remove('active'));

            const target = e.target.tagName === 'DIV' ? e.target : e.target.parentNode;
            target.classList.add('active');

            this.taskList.dataset.filter = target.id;

            this.#syncSlider(target);
        });

        this.taskList.addEventListener('click', e => {
            this.fnCheckTask(e) || this.fnDeleteTask(e) || this.fnModifyTask(e);
        });
    }

    #init() {
        this.#syncSlider(this.tabs.children[0]);

        this.tabsObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target.classList.contains('active')) {
                    this.#syncSlider(entry.target);
                    break;
                }
            }
        });

        [].forEach.call(this.tabs.children, tab => this.tabsObserver.observe(tab));
    }

    fnAppendTask() {
        if (this.iconAdd.classList.contains('disabled')) return;

        const lastChild = this.taskList.lastElementChild;
        const id = lastChild ? String(+lastChild.id + 1) : '1';

        const newTask = makeTag({tagName: 'li', id, className: "task" }, el => { el.dataset.type = 'to-do' },
            makeTag('label',
                makeTag('input', el => { el.type = 'checkbox' }), makeTag('span'),
                makeTag({ tagName: 'span', className: 'task-text', textContent: this.inputNew.value })
            ),
            makeTag({ tagName: 'span', className: 'icon-delete' },
                makeTag({ tagName: 'i', className: 'fa-regular fa-trash-can' } )
            )
        );

        this.#incBadge(this.tabs.children[0], 1);
        this.#incBadge(this.tabs.children[1], 1);

        this.taskList.appendChild(newTask);

        this.inputNew.value = '';
        this.iconAdd.classList.add('disabled');

        const scrollHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );

        this.taskList.style.maxHeight = (scrollHeight - this.taskList.getBoundingClientRect().top) + 'px';
    }

    constructor(root = document.body) {
        this.#initSelectors(root);
        this.#initEvents();
        this.#init();
    }
}

const root = document.getElementById('root');

new ToDoList(root);

