const createAutoComplete = ({
    root, 
    renderOption, 
    onOptionSelect, 
    inputValue,
    fetchData
}) => {
    root.innerHTML = `
        <label><b>Search</b></label>
        <input class="input"/>
        <div class="dropdown">
            <div class="dropdown-menu">
                <div class="dropdown-content results"></div>
            </div>
        </div>
    `;

    const input = root.querySelector("input");
    const dropdown = root.querySelector(".dropdown");
    const resultsWrapper = root.querySelector(".results");

    const onInput = async event =>{
        const items = await fetchData(event?.target?.value);

        if(!items.length){
            dropdown.classList.remove("is-active");
            return;
        }

        resultsWrapper.innerHTML = "";
        dropdown.classList.add("is-active");

        items?.map(item => {
            const optionItems = document.createElement("a");

            optionItems.classList.add("dropdown-item");

            optionItems.innerHTML = renderOption(item);
            optionItems.addEventListener("click", () => {
                dropdown.classList.remove("is-active");
                input.value = inputValue(item);
                onOptionSelect(item);
            })

            resultsWrapper?.appendChild(optionItems);

        })
        console.log(items)
    };

    input.addEventListener("input", debounce(onInput, 2000));

    document.addEventListener("click", event => {
        if (!root.contains(event.target)){
            dropdown.classList.remove("is-active");
        }
    });
};