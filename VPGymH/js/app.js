(function() {
    var XML_ADDRESS = "https://vpgh.lima-city.de/api/tizen/?c=Q11",
        XML_METHOD = "GET",
        MSG_ERR_NODATA = "Keine Vertretungen",
        MSG_ERR_NOTCONNECTED = "Verbindung abgebrochen. Internetverbindung prüfen.",
        NUM_MAX_NEWS = 50,
        NUM_MAX_LENGTH_SUBJECT = 64,
        arrayNews = [],
        indexDisplay = 0,
        lengthNews = 0;

    function emptyElement(elm) {
        while (elm.firstChild) {
            elm.removeChild(elm.firstChild);
        }

        return elm;
    }

    function keyEventHandler(event) {
        if (event.keyName === "back") {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    }
    
    function addTextElement(objElm, textClass, textContent) {
        var newElm = document.createElement("p");

        newElm.className = textClass;
        newElm.appendChild(document.createTextNode(textContent));
        objElm.appendChild(newElm);
    }

    function trimText(text, maxLength) {
        var trimmedString;

        if (text.length > maxLength) {
            trimmedString = text.substring(0, maxLength - 3) + "...";
        } else {
            trimmedString = text;
        }
        return trimmedString;
    }

    function showNews(index) {
        var objNews = document.querySelector("#area-news"),
            objPagenum = document.querySelector("#area-pagenum");

        emptyElement(objNews);
        addTextElement(objNews, "subject", arrayNews[index].title);
        emptyElement(objPagenum);
        addTextElement(objPagenum, "pagenum", "Seite " + (index + 1) + "/" + lengthNews);
    }

    function showNextNews() {
        if (lengthNews > 0) {
            indexDisplay = (indexDisplay + 1) % lengthNews;
            showNews(indexDisplay);
        }
    }
    

    function showPrevNews() {
        if (lengthNews > 0) {
            indexDisplay = (indexDisplay - 1) % lengthNews;
            showNews(indexDisplay);
        }
    }

    function getDataFromXML() {
        var objNews = document.querySelector("#area-news"),
            xmlhttp = new XMLHttpRequest(),
            xmlDoc,
            dataItem,
            i;

        arrayNews = [];
        lengthNews = 0;
        indexDisplay = 0;
        emptyElement(objNews);

        xmlhttp.open(XML_METHOD, XML_ADDRESS, false);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                xmlDoc = xmlhttp.responseXML;
                dataItem = xmlDoc.getElementsByTagName("item");

                if (dataItem.length > 0) {
                    lengthNews = (dataItem.length > NUM_MAX_NEWS) ? NUM_MAX_NEWS : dataItem.length;
                    for (i = 0; i < lengthNews; i++) {
                        arrayNews.push({
                            title: dataItem[i].getElementsByTagName("title")[0].childNodes[0].nodeValue,
                            link: dataItem[i].getElementsByTagName("link")[0].childNodes[0].nodeValue
                        });
                        arrayNews[i].title = trimText(arrayNews[i].title, NUM_MAX_LENGTH_SUBJECT);
                    }
                    showNews(indexDisplay);
                } else {
                    addTextElement(objNews, "subject", MSG_ERR_NODATA);
                }
                xmlhttp = null;
            } else {
                addTextElement(objNews, "subject", MSG_ERR_NOTCONNECTED);
            }
        };
        xmlhttp.send();
    }

    function setDefaultEvents() {
        document.addEventListener("tizenhwkey", keyEventHandler);
        document.addEventListener('rotarydetent', function(e) {
            if (e.detail.direction === 'CW') {
            	console.log("VPLOG: CW");
            	showNextNews();
            } else if (e.detail.direction === 'CCW') {
            	console.log("VPLOG: CCW");
            	showPrevNews();
            }
        });
        document.querySelector("#area-news").addEventListener("click", showNextNews);
    }

    function init() {
        setDefaultEvents();
        getDataFromXML();
    }
    window.onload = init;
}());