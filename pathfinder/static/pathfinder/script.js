document.addEventListener("DOMContentLoaded", function() {
            const routeForm = document.getElementById('route-form');
            const errorMessage = document.getElementById('error-message');
            const floorMaps = document.querySelectorAll('.floor-map');
            const floorButtonsContainer = document.getElementById('floor-buttons');
            const floorNavigation = document.getElementById('floor-navigation');
            const clearRouteButton = document.getElementById('clear-route');
            let currentRoute = [];

            // Получить все кнопки этажей
            const floorButtons = floorButtonsContainer.querySelectorAll('button');

            // Добавить обработчики событий для всех этажных кнопок
            floorButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const floorNumber = parseInt(button.dataset.floor, 10); // Преобразование в число
                    displayFloor(floorNumber);

                    // Обновить активный класс кнопки
                    floorButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                });
            });

            // Обработка отправки формы
            routeForm.addEventListener('submit', function(event) {
                event.preventDefault();
                errorMessage.textContent = '';

                const formData = new FormData(routeForm);
                const csrfToken = formData.get('csrfmiddlewaretoken');

                fetch("{% url 'find_route' %}", {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        currentRoute = data.route;
                        displayRoute();
                        clearRouteButton.style.display = 'inline-block';
                        highlightFloorsInRoute();
                    } else {
                        errorMessage.textContent = data.message;
                        clearRouteButton.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    errorMessage.textContent = 'Произошла ошибка при поиске маршрута.';
                });
            });

            // Функция для отображения маршрута на всех этажах
            function displayRoute() {
                floorMaps.forEach(floorDiv => {
                    const floorNumber = parseInt(floorDiv.id.split('-')[1], 10); // Преобразование в число
                    const svg = floorDiv.querySelector('.route-svg');
                    svg.innerHTML = '';

                    // Проходим по всем парам последовательных узлов маршрута
                    for (let i = 0; i < currentRoute.length - 1; i++) {
                        const from = currentRoute[i];
                        const to = currentRoute[i + 1];

                        // Логирование для отладки
                        console.log(`Проверка соединения между узлами ${from.id} (Этаж ${from.floor}) и ${to.id} (Этаж ${to.floor})`);

                        // Если оба узла на текущем этаже, рисуем линию
                        if (from.floor === floorNumber && to.floor === floorNumber) {
                            console.log(`Добавляем линию от (${from.x}, ${from.y}) до (${to.x}, ${to.y}) на этаже ${floorNumber}`);
                            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                            line.setAttribute("x1", from.x);
                            line.setAttribute("y1", from.y);
                            line.setAttribute("x2", to.x);
                            line.setAttribute("y2", to.y);
                            line.setAttribute("stroke", "darkblue");
                            line.setAttribute("stroke-width", "10"); // Подкорректируйте под ваш масштаб
                            svg.appendChild(line);
                        }
                    }

                    // Добавляем маркеры узлов (только начальный и конечный)
                    addMarkers(floorNumber);
                });
            }

            // Функция для добавления маркеров узлов
            function addMarkers(floorNumber) {
                floorMaps.forEach(floorDiv => {
                    if (parseInt(floorDiv.id.split('-')[1], 10) === floorNumber) {
                        const svg = floorDiv.querySelector('.route-svg');

                        // Определяем начальный и конечный узлы
                        const startNode = currentRoute[0];
                        const endNode = currentRoute[currentRoute.length - 1];

                        const markersToAdd = [];
                        if (startNode.floor === floorNumber) {
                            markersToAdd.push({ node: startNode, color: "darkblue", label: "Начало" });
                        }
                        if (endNode.floor === floorNumber && endNode.id !== startNode.id) {
                            markersToAdd.push({ node: endNode, color: "darkblue", label: "Конец" });
                        }

                        markersToAdd.forEach(({ node, color, label }) => {
                            // Создание круга
                            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                            circle.setAttribute("cx", node.x);
                            circle.setAttribute("cy", node.y);
                            circle.setAttribute("r", "15"); // Размер маркера соответствует масштабу
                            circle.setAttribute("fill", color);
                            circle.classList.add('route-marker');
                            svg.appendChild(circle);

                            // Создание текста для подсказки
                            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                            text.setAttribute("x", node.x + 20); // Подкорректируйте позицию текста
                            text.setAttribute("y", node.y - 20);
                            text.setAttribute("fill", "black");
                            text.setAttribute("font-size", "45px"); // Размер текста соответствует масштабу
                            text.textContent = label;
                            text.setAttribute("visibility", "visible");
                            svg.appendChild(text);

                            // Обработчики событий для показа/скрытия подсказки
                            circle.addEventListener('mouseover', () => {
                                text.setAttribute("visibility", "visible");
                            });
                            circle.addEventListener('mouseout', () => {
                                text.setAttribute("visibility", "visible");
                            });
                        });
                    }
                });
            }

            // Функция для выделения этажей, участвующих в маршруте
            function highlightFloorsInRoute() {
                const floorsInRoute = [...new Set(currentRoute.map(node => node.floor))].sort((a, b) => a - b);
                floorButtons.forEach(button => {
                    const floorNumber = parseInt(button.dataset.floor, 10);
                    if (floorsInRoute.includes(floorNumber)) {
                        button.classList.add('active-floor-highlight');
                    } else {
                        button.classList.remove('active-floor-highlight');
                    }
                });
            }

            // Функция для отображения выбранного этажа
            function displayFloor(floorNumber) {
                console.log(`Отображение этажа: ${floorNumber}`);

                // Скрыть все этажи
                floorMaps.forEach(floor => floor.classList.remove('active-floor'));

                // Показать выбранный этаж
                const floorDiv = document.getElementById(`floor-${floorNumber}`);
                if (floorDiv) {
                    floorDiv.classList.add('active-floor');
                }

                // Обновить активный класс кнопки
                floorButtons.forEach(btn => {
                    if (parseInt(btn.dataset.floor, 10) === floorNumber) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }

            // Функция для очистки маршрута
            clearRouteButton.addEventListener('click', function() {
                currentRoute = [];
                errorMessage.textContent = '';
                clearRouteButton.style.display = 'none';
                floorMaps.forEach(floor => {
                    const svg = floor.querySelector('.route-svg');
                    svg.innerHTML = '';
                });

                // Сбросить выделения этажей
                floorButtons.forEach(btn => btn.classList.remove('active-floor-highlight'));
                // Сбросить активную кнопку
                floorButtons.forEach(btn => btn.classList.remove('active'));
                // Показать первый этаж
                if (floorButtons.length > 0) {
                    floorButtons[0].classList.add('active');
                    displayFloor(parseInt(floorButtons[0].dataset.floor, 10));
                }

                // Сбросить форму
                routeForm.reset();
            });
        });









// Функция для инициализации масштабирования и панорамирования

        const svgContainer = document.querySelector('.svg-container');
        const floorSvg = svgContainer.querySelector('svg.floor-svg');
        const routeSvg = svgContainer.querySelector('svg.route-svg');

        let scale = 1;  // Начальный масштаб
        const MIN_SCALE = 1;  // Ограничение на минимальный масштаб
        const MAX_SCALE = 3;  // Ограничение на максимальный масштаб (если нужно)
        let startX, startY;  // Начальные координаты для панорамирования
        let isDragging = false;

        // Обработчик события масштабирования (через колесо мыши)
        svgContainer.addEventListener('wheel', function(event) {
            event.preventDefault();  // Предотвращаем стандартное поведение прокрутки страницы

            // Определение направления зума
            const zoomIn = event.deltaY < 0;
            const zoomFactor = 0.1;  // Фактор зума

            // Применяем масштаб с ограничением
            if (zoomIn && scale < MAX_SCALE) {
                scale += zoomFactor;
            } else if (!zoomIn && scale > MIN_SCALE) {
                scale -= zoomFactor;
            }

            // Применяем новый масштаб
            floorSvg.style.transform = `scale(${scale})`;
            routeSvg.style.transform = `scale(${scale})`;
        });

        // Обработчик события начала перетаскивания (панорамирование)
        svgContainer.addEventListener('mousedown', function(event) {
            isDragging = true;
            startX = event.clientX - svgContainer.offsetLeft;
            startY = event.clientY - svgContainer.offsetTop;
            svgContainer.style.cursor = 'grabbing';
        });

        // Обработчик события завершения перетаскивания
        svgContainer.addEventListener('mouseup', function() {
            isDragging = false;
            svgContainer.style.cursor = 'grab';
        });

        // Обработчик события движения мыши
        svgContainer.addEventListener('mousemove', function(event) {
            if (isDragging) {
                const deltaX = event.clientX - startX;
                const deltaY = event.clientY - startY;
                floorSvg.style.transform = `scale(${scale}) translate(${deltaX}px, ${deltaY}px)`;
                routeSvg.style.transform = `scale(${scale}) translate(${deltaX}px, ${deltaY}px)`;
            }
        });

        // Обработчик события для тач-устройств (на мобильных устройствах)
        svgContainer.addEventListener('touchstart', function(event) {
            if (event.touches.length === 1) {
                isDragging = true;
                startX = event.touches[0].clientX - svgContainer.offsetLeft;
                startY = event.touches[0].clientY - svgContainer.offsetTop;
                svgContainer.style.cursor = 'grabbing';
            }
        });

        svgContainer.addEventListener('touchend', function() {
            isDragging = false;
            svgContainer.style.cursor = 'grab';
        });

        svgContainer.addEventListener('touchmove', function(event) {
            if (isDragging && event.touches.length === 1) {
                const deltaX = event.touches[0].clientX - startX;
                const deltaY = event.touches[0].clientY - startY;
                floorSvg.style.transform = `scale(${scale}) translate(${deltaX}px, ${deltaY}px)`;
                routeSvg.style.transform = `scale(${scale}) translate(${deltaX}px, ${deltaY}px)`;
            }
        });

