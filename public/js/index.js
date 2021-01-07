$(document).ready(() => {
    function isPage(body_class){
        return $("body").hasClass(body_class);
    }

    if(isPage("home") || isPage("clearance-page")){
        const searchClient = algoliasearch('P96EB1S1TP', 'af985ac63b4151125bdbb81dfc4dd804');

        let indexName = document.cookie.split(";")
            .find(cookie => cookie.includes("_indexName="))
            .split("=")[1];

            const search = instantsearch({
                indexName,
                searchClient
            });
    
            let configure = instantsearch.widgets.configure({
                hitsPerPage: 12,
            });
    
            let searchBox = instantsearch.widgets.searchBox({
                container: '#searchbox',
                showSubmit: false,
                showReset:false,
                placeholder:'Search deals...',
                cssClasses: {
                    root:["search-wrapper", "px-3"],
                    form:["w-100", "d-flex"],
                    input:"inSearch"
                }
            });

            let sortBy = instantsearch.widgets.sortBy({
                container: '#sort-by',
                cssClasses: {
                    root:["pr-3", "h-100"]
                },
                items: [
                    { label: 'Default', value: indexName },
                    { label: 'Price (asc)', value: `${indexName}_price_asc` },
                    { label: 'Price (desc)', value: `${indexName}_price_asc` },
                    { label: 'Savings (asc)', value: `${indexName}_save_asc` },
                    { label: 'Savings (desc)', value: `${indexName}_save_desc` },
                ],
            });
    
            let hits = instantsearch.widgets.hits({
                container: '#hits',
                cssClasses: {
                    root:["playlist-wrapper","mt-4"],
                    list:["row","no-list-style","justify-content-center"],
                    item:["margin-bottom", "col-md-4", "col-6"]
                },
                templates: {
                    item(product) {
                        return `
                            <div class="product-wrapper">
                                <figure class="product-image position-relative">
                                    <a href="https://www.onedayonly.co.za${ product.url }" target="_h">
                                        <img src="${ product.image }" alt="${ product.brand } - ${ product.name }" class="w-100" />
                                    </a>
                                    ${ product.savings ? `<div class="product-savings position-absolute">${product.savings.toString().includes("%") ? product.savings : "R" + numeral(product.savings).format('0,0')}</div>` : "" }
                                </figure>
                                <div class="product-info" >
                                    <a class="product-title" href="https://www.onedayonly.co.za${ product.url }" target="_h">${product.brand} - 
                                        <span class="">${product.name}</span>
                                    </a>
                                    <div class="product-pricing ${product.soldout ? "soldout":""}">
                                        ${product.retail ? `<span class="retail-pricing">R${numeral(product.retail).format('0,0')}</span>`:""} R${numeral(product.price).format('0,0')} 
                                    </div>
                                    ${product.soldout ? `<div class="soldout-note">Sold Out</div>`:""} 
                                </div>
                            </div>
                        `;
                    }
                }
            });

            let pagination = instantsearch.widgets.pagination({
                container: '#pagination',
                templates: {
                    next:"Next",
                    previous: "Previous"
                },
                scrollTo:"#searchbox"
            });

            search.addWidgets([configure, searchBox, hits, pagination, sortBy]);
    
            search.start();
    }

    feather.replace();
});