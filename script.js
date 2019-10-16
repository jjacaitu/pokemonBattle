

let timer;

pokemonApp = {};



pokemonApp.init = () => {
   
    $(".reload").on("click",()=>{
        
        location.reload();
    })

    pokemonApp.playerPokemons = [];

    pokemonApp.vsPokemons = []

    pokemonApp.playerMovesToCheck = [];

    pokemonApp.vsMovesToCheck = [];

    pokemonApp.cpuActivePokemonIndex = undefined;

    pokemonApp.typesEffectiveness = {};

    pokemonApp.playerRemainingPokemon = 0;

    pokemonApp.startClick;
    pokemonApp.choosePokemonClick;
    pokemonApp.choosePokemonButtonClick;

    

  console.log(pokemonApp.playerPokemons);

  console.log(pokemonApp.vsPokemons);

  pokemonApp.generateEffectivenessData();

  console.log(pokemonApp.typesEffectiveness);
}

pokemonApp.getRandomPokemon = async function (pokemonGroup,movesToCheck,randomNumber,handicap){

    try{
        pokemonGroup.push({
            stats: {},
            type: [],
            selectedMoves: [],
            possibleMoves: [],
            ready: false
        });
    
        movesToCheck.push(1);
        
        const pokemonIndex = pokemonGroup.length - 1;
    
        const url = `https://pokeapi.co/api/v2/pokemon/${randomNumber}`;
    
        const pokemonData = await fetch(url);
    
        const pokemonDataRecieved = await pokemonData.json();
    
    
        const pokemonBeingAdded = pokemonGroup[pokemonIndex];
    
        pokemonBeingAdded.name = pokemonDataRecieved.name
    
        pokemonBeingAdded.id = pokemonDataRecieved.id
    
      
        pokemonBeingAdded.image_front = pokemonDataRecieved.sprites.front_default;
    
        pokemonBeingAdded.image_back = pokemonDataRecieved.sprites.back_default;
    

        pokemonDataRecieved.stats.forEach((stat)=>{
            pokemonBeingAdded.stats[stat.stat.name] = Math.ceil(stat.base_stat * handicap);
        })
    
    
        pokemonDataRecieved.types.forEach((type)=>{
            pokemonBeingAdded.type.push(type.type.name);
        });

        pokemonBeingAdded.stats.fullHp = pokemonBeingAdded.stats.hp;
    
        
    
        const moves = pokemonDataRecieved.moves;
    
    
    
        moves.forEach((move,index)=>{
            pokemonBeingAdded.possibleMoves.push({
                name: move.move.name,
                url : move.move.url,
                
            });
            
            pokemonApp.getPokemonMovesInfo(pokemonGroup,movesToCheck,move.move.url,pokemonIndex,index);

    
        });

        
    } catch(e){
        console.log(e);
    }

}

pokemonApp.takeOutLastSlashInUrl = (url) => {
     const splittedUrl = url.split("");
     splittedUrl.splice(splittedUrl.length - 1,1);
     const newUrl = splittedUrl.join("");

     return newUrl;
}

pokemonApp.getPokemonMovesInfo = async function (pokemonGroup,movesToCheck,url,pokemonIndex, index){

    try{

        const newUrl = pokemonApp.takeOutLastSlashInUrl(url);
        const moveData = await fetch(newUrl);

        const moveInformationRecieved = await moveData.json();


        const moveBeingAdded = pokemonGroup[pokemonIndex].possibleMoves;


        if(moveInformationRecieved.accuracy !== null && moveInformationRecieved.power !== null){
            moveBeingAdded[index].accuracy = moveInformationRecieved.accuracy;
            moveBeingAdded[index].power = moveInformationRecieved.power;
            moveBeingAdded[index].pp = moveInformationRecieved.pp;
            moveBeingAdded[index].priority = moveInformationRecieved.priority;
            moveBeingAdded[index].type = moveInformationRecieved.type.name;
            moveBeingAdded[index].class =  moveInformationRecieved.damage_class.name;
            movesToCheck[pokemonIndex] += 1;  
        } else {
            movesToCheck[pokemonIndex] += 1; 
        }

        if(movesToCheck[pokemonIndex] === moveBeingAdded.length){
            pokemonApp.getFourRandomMoves(pokemonGroup,pokemonIndex);
            pokemonGroup[pokemonIndex].ready = true;
            const numberOfPokemons = pokemonApp.length;
            if(pokemonApp.playerPokemons[numberOfPokemons - 1].ready && pokemonApp.vsPokemons[numberOfPokemons - 1].ready){
                setTimeout(() => {
                    clearTimeout(timer);
                    $(".loading").remove();
                    $(".choosePokemon .pokemonButton").remove();
                    pokemonApp.playerPokemons.forEach((pokemon,index)=>{
                        $(".choosePokemon .pokemonButtonsDiv").append(`<button class="pokemonButton active ${pokemon.name}_${index}" value="${index}"><img src="${pokemon.image_front}" alt="${pokemon.name}"></button>`);
                        $(".start").fadeOut();
                    })

                    if(pokemonApp.checkUndefined()){
                        alert("It seems all the pokemon are either recovering or in battle, please reload the page and try again!");
                        location.reload();
                    }

                    $(".gameBoard").fadeIn(); 
                }, 2000);
            }
               
        }
    } catch(e){
        console.log(e);
    }

}

pokemonApp.getRandomNumber = function (maxNumber){
    return Math.floor(Math.random() * maxNumber);
}

pokemonApp.getFourRandomMoves = function (pokemonGroup,pokemonIndex){

    const moves_list = [];
    const possibleMoves = pokemonGroup[pokemonIndex].possibleMoves;
    const selectedMoves = pokemonGroup[pokemonIndex].selectedMoves;
    for(let i = 0; i < possibleMoves.length; i++){
        if(possibleMoves[i].accuracy !== undefined){
            moves_list.push(i);
        }
    }

    if(moves_list.length < 4 || possibleMoves.length < 4){
        alert("It seems all the pokemon are either recovering or in battle, please reload the page and try again!");
        location.reload();
        
        
    }else{
        for(let i=0; i< 4;i++){
        
            const randomMove = pokemonApp.getRandomNumber(moves_list.length);
            selectedMoves.push(possibleMoves[moves_list[randomMove]]);
            moves_list.splice(randomMove,1);   
        }
    
    }
    
}

pokemonApp.startClick = $("form").on("submit",(event)=>{
    event.preventDefault();
    timer = setTimeout(() => {
        alert("It seems all the pokemon are either recovering or in battle, please reload the page and try again!");
        location.reload();
    }, 10000);
    pokemonApp.difficulty = $(".difficulty_div input[type='radio']:checked").val();
    pokemonApp.length = $(".length_div input[type='radio']:checked").val();
    $(".intro").fadeOut();

    

    for(i=0;i<pokemonApp.length;i++){
        pokemonApp.getRandomPokemon(pokemonApp.playerPokemons,pokemonApp.playerMovesToCheck,pokemonApp.getRandomNumber(600),1);
        pokemonApp.playerRemainingPokemon += 1;
   }

   for(i=0;i<pokemonApp.length;i++){
       pokemonApp.getRandomPokemon(pokemonApp.vsPokemons,pokemonApp.vsMovesToCheck,pokemonApp.getRandomNumber(600),pokemonApp.difficulty);
  }
    
});

pokemonApp.choosePokemonClick = $(".choosePokemon").on("click",".pokemonButton",function(){
    $(".choosePokemon").fadeOut();

    

    if(pokemonApp.activePlayersPokemonIndex != undefined){
        
        const previousPokemon = pokemonApp.playerPokemons[pokemonApp.activePlayersPokemonIndex];

        $(`.${previousPokemon.name}`).removeAttr("disabled").addClass("active");
    }
   
    
    
    const pokemonChosen = pokemonApp.playerPokemons[$(this).val()];

    $(`.${pokemonChosen.name}_${$(this).val()}`).attr("disabled","true").removeClass("active");

    $(".moves").empty();

    pokemonChosen.selectedMoves.forEach((move,index)=>{
        if(move.pp > 0){
            $(".moves").append(`<button class="moveButton moveButton_${move.name}" value="${index}"><p class="moveName">${move.name.toUpperCase()}</p><p>TYPE: ${move.type.toUpperCase()}<div><p class="pp"> PP:${move.pp}</p><p> POWER:${move.power}</p></div></button>`);
        }else{
            $(".moves").append(`<button class="disabledButton moveButton_${move.name}" value="${index}" disabled><p>${move.name.toUpperCase()}</p><p>TYPE: ${move.type.toUpperCase()}<div><p class="pp"> PP:${move.pp}</p><p> POWER:${move.power}</p></div></button>`);
        }
    

        $(`.moveButton_${move.name}`).on("click",function()
        {   
            $(".moveButton").attr("disabled","true");
            $(".change").attr("disabled","true");

            const attackingPokemon = pokemonApp.playerPokemons[pokemonApp.activePlayersPokemonIndex];

            const moveUsed = move;
            
            const defendingPokemon = pokemonApp.vsPokemons[pokemonApp.cpuActivePokemonIndex];

            pokemonApp.attack(attackingPokemon,moveUsed,defendingPokemon);

        })
    });


    if(pokemonApp.cpuActivePokemonIndex === undefined){
        
        pokemonApp.playerPokemons.forEach((pokemon, index)=>{
            $(".playersPokemonInfo .nameInfo").append(`<img class='pokeball_${index + 1}' src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' alt='pokeball'>`);
        })

        pokemonApp.vsPokemons.forEach((pokemon, index)=>{
            $(".cpusPokemonInfo .nameInfo").append(`<img class='pokeball_${index + 1}' src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' alt='pokeball'>`);
        })

        $(".playersPokemonInfo").fadeIn();

        $(".cpusPokemonInfo").fadeIn();

        $(".cancel").fadeIn();

        $(".cancel").on("click",()=>{
            $(".choosePokemon").fadeOut();
        })
        
        $(".moveButton").attr("disabled","true");
        
        $(".other").append("<button class='change' disabled>Change Pokemon</button>");
        pokemonApp.changeCpuPokemon();

    }else if(pokemonApp.activePlayersPokemonIndex !== undefined){
        setTimeout(() => {
            pokemonApp.cpuRandomAttack();
        }, 2000);
        
    }
    $(".playerBattlingPokemon").remove();

    pokemonApp.activePlayersPokemonIndex = $(this).val();
    pokemonApp.playerPokeballAnimation();

    setTimeout(() => {
        $(".playersPokemonInfo").before(`<img class="playerBattlingPokemon" src="${pokemonChosen.image_back}" alt="${pokemonChosen.name}">`);
    }, 1500);
     

    const remainingHpPorcentage = Math.ceil((pokemonChosen.stats.hp/pokemonChosen.stats.fullHp) * 100);

    if(remainingHpPorcentage >= 50){
        $(`.playersPokemonInfo .healthBar`).css("background",`linear-gradient(to right, green ${remainingHpPorcentage}% ,black 0%)`);

    }else if(remainingHpPorcentage > 25){
        $(`.playersPokemonInfo .healthBar`).css("background",`linear-gradient(to right, orange ${remainingHpPorcentage}% ,black 0%)`);

    }else{
        $(`.playersPokemonInfo .healthBar`).css("background",`linear-gradient(to right, red ${remainingHpPorcentage}% ,black 0%)`);

    }
 
    $(".playersPokemon .name").text(pokemonChosen.name.toUpperCase());
    

});

pokemonApp.cpuRandomAttack = () => {

    const cpuPokemon = pokemonApp.vsPokemons[pokemonApp.cpuActivePokemonIndex];

    const cpuPokemonMoves = cpuPokemon.selectedMoves;

    const randomNumber = pokemonApp.getRandomNumber(10);

    const defendingPokemon = pokemonApp.playerPokemons[pokemonApp.activePlayersPokemonIndex]; 

    if(cpuPokemon.stats.hp < defendingPokemon.stats.hp && randomNumber === 9 && pokemonApp.vsPokemons.length >1){
        pokemonApp.changeCpuPokemon(true);


    }else{
        

        const randomMoveIndex = pokemonApp.getRandomNumber(cpuPokemonMoves.length);

        const randomMove = cpuPokemonMoves[randomMoveIndex];

        pokemonApp.attack(cpuPokemon,randomMove,defendingPokemon,randomMoveIndex);
    }

    

}

pokemonApp.choosePokemonButtonClick = $(".other").on("click",".change",()=>{
    $(".choosePokemon").fadeIn();
})

pokemonApp.makeAlert = (message) => {
    $(".alerts").fadeIn();
    $(".alerts p").text(message)
    setTimeout(() => {
        $(".alerts").fadeOut();
    }, 1000);
}


pokemonApp.attack = (attackingPokemon,move,defendingPokemon,moveIndex) => {

    // alert(`${attackingPokemon.name} just used ${move.name}`);
    pokemonApp.makeAlert(`${attackingPokemon.name.toUpperCase()} used ${move.name.toUpperCase()}`);

    const damageDone = pokemonApp.calculateDamage(attackingPokemon,move,defendingPokemon);

    if(damageDone > 0) {
        if(defendingPokemon === pokemonApp.playerPokemons[pokemonApp.activePlayersPokemonIndex]){
            setTimeout(() => {
                $(".playerBattlingPokemon").addClass("hitted"); 
            }, 1000);
            
            $(".cpuBattlingPokemon").addClass("attacking");
        }else{
            setTimeout(() => {
                $(".cpuBattlingPokemon").addClass("hitted"); 
            }, 1000);
            
            $(".playerBattlingPokemon").addClass("attacking");
        }
    }

    let attackingDivClass = "";
    let defendingDivClass = "";

    if(attackingPokemon === pokemonApp.playerPokemons[pokemonApp.activePlayersPokemonIndex]){
        attackingDivClass = ".playersPokemonInfo";
        defendingDivClass = ".cpusPokemonInfo";
    }else{
        attackingDivClass = ".cpusPokemonInfo";
        defendingDivClass = ".playersPokemonInfo"
        setTimeout(() => {
            $(".moveButton").removeAttr("disabled");
            $(".change").removeAttr("disabled"); 
        }, 2000);
    }
    
    if(move.pp !== 0 ){
        move.pp -= 1;
        defendingPokemon.stats.hp -= damageDone;
        
        if(defendingPokemon.stats.hp < 0 ){
            defendingPokemon.stats.hp = 0;
        }
        $(`${defendingDivClass} .health`).text(`HP: ${defendingPokemon.stats.hp}`);

        const remainingHpPorcentage = Math.ceil((defendingPokemon.stats.hp/defendingPokemon.stats.fullHp) * 100);

        setTimeout(() => {
            if(remainingHpPorcentage >= 50){
                $(`${defendingDivClass} .healthBar`).css("background",`linear-gradient(to right, green ${remainingHpPorcentage}% ,black 0%)`);
        
            }else if(remainingHpPorcentage > 25){
                $(`${defendingDivClass} .healthBar`).css("background",`linear-gradient(to right, orange ${remainingHpPorcentage}% ,black 0%)`);
    
            }else{
                $(`${defendingDivClass} .healthBar`).css("background",`linear-gradient(to right, red ${remainingHpPorcentage}% ,black 0%)`);
    
            }
        }, 2000);

       

        if(attackingDivClass === ".playersPokemonInfo"){
            $(`.moveButton_${move.name} .pp`).text(`PP: ${move.pp}`);
            if(defendingPokemon.stats.hp > 0){

                setTimeout(() => {
                    pokemonApp.cpuRandomAttack();  
                }, 4000);
                
                
            }else{
                setTimeout(() => {
                    $(".cpuBattlingPokemon").addClass("fainted");
                    pokemonApp.makeAlert(`${defendingPokemon.name.toUpperCase()} fainted..`);
                    pokemonApp.vsPokemons.splice(pokemonApp.cpuActivePokemonIndex,1);
                    setTimeout(() => {
                        pokemonApp.changeCpuPokemon();
                        $(`.cpusPokemonInfo .pokeball_${pokemonApp.vsPokemons.length + 1}`).css("opacity","0.5");
                    }, 2000);
                }, 3000);
                
                
            }
        }else{
            if(defendingPokemon.stats.hp === 0){
                
                $(`.${defendingPokemon.name}_${pokemonApp.activePlayersPokemonIndex}`).attr("disabled","true").removeClass("active").addClass("faint");
                setTimeout(() => {
                    $(".playerBattlingPokemon").addClass("fainted");
                    pokemonApp.makeAlert(`${defendingPokemon.name.toUpperCase()} fainted..`);
                }, 2000);
                
                setTimeout(() => {
                    
                    $(".playerBattlingPokemon").remove();
                    $('.moves').empty(); 
                }, 3000);
                
                
                delete pokemonApp.playerPokemons[pokemonApp.activePlayersPokemonIndex];
                pokemonApp.activePlayersPokemonIndex = undefined;
                pokemonApp.playerRemainingPokemon -= 1;
                $(`.playersPokemonInfo .pokeball_${pokemonApp.playerRemainingPokemon + 1}`).css("opacity","0.5");
                if(pokemonApp.playerRemainingPokemon === 0){
                    
                    setTimeout(() => {
                        $(".final_message").fadeIn(); 
                        $(".final_message p").text("You just ran out of pokemons... The pokemon master wins!");
                        $(".reload").text("TRY AGAIN");
                    }, 3000);
                    
                }else{
                    setTimeout(() => {
                        $(`.choosePokemon`).fadeIn();
                    }, 4000);
                   
                }
                
                


            }
        }

        if(move.pp === 0){
            $(`.moveButton_${move.name}`).attr("disabled","true").removeClass("moveButton").addClass("disabledButton");

            if(attackingDivClass === ".cpusPokemonInfo"){
                attackingPokemon.selectedMoves.splice(moveIndex,1);
            }
        }

        
   
    }
    setTimeout(() => {
        $(".hitted").removeClass("hitted");
        $(".attacking").removeClass("attacking")
        
    }, 2000);
    
    

}

pokemonApp.calculateDamage = (atackingPokemon,move,defendingPokemon) => {
    let defenseStat;
    let attackStat;
    if(move.class === "normal"){
        defenseStat = defendingPokemon.stats.defense;
        attackStat = atackingPokemon.stats.attack;
    }else{
        defenseStat = defendingPokemon.stats["special-defense"];
        attackStat = atackingPokemon.stats["special-attack"];
    }

    const power = move.power;

    const effective = pokemonApp.checkEffectiveness(move,defendingPokemon);

    return Math.ceil(((((2 * power * (attackStat/defenseStat))/50)+2))*effective);
}

pokemonApp.checkEffectiveness = (move,defendingPokemon)=>{
    const moveType = move.type;
    const defendingTypes = defendingPokemon.type;
    const moveTypeEffects = pokemonApp.typesEffectiveness[moveType];
    let effectivenessNumber = 1;

    defendingTypes.forEach((type)=>{
        const effect = moveTypeEffects[type];
        if( effect !== undefined && effect !== null){
            if(effect === "doubleDamage"){
                effectivenessNumber *= 2;
            }else if(effect === "halfDamage"){
                effectivenessNumber /= 2;
            }else{
                effectivenessNumber *= 0;
            }
        }

    })

    let message = "";

    if(effectivenessNumber >= 2){
        message = "It's supper effective!";
    }else if(effectivenessNumber === 0){
        message = `It has no effect on ${defendingPokemon.name.toUpperCase()}`;
    }else if(effectivenessNumber < 1){
        message = "It's not that effective!";
    }else{
        message = `It has a normal effect in ${defendingPokemon.name.toUpperCase()}`;
    }


    
    
    setTimeout(() => {
        pokemonApp.makeAlert(message); 
    }, 2000);
    
    

    return effectivenessNumber;
}

pokemonApp.generateEffectivenessData = async () => {
    const availableTypesUrl = "https://pokeapi.co/api/v2/type";

    const typePromise = await fetch(availableTypesUrl);
    const typesData = await typePromise.json();

    typesData.results.forEach((type)=>{

        pokemonApp.typesEffectiveness[type.name] = {};

        pokemonApp.getEffectivenessForType(type.url,type.name);



    })


}

pokemonApp.getEffectivenessForType = async (typeUrl,typeName) => {

    const typeEffectivenessPromise = await fetch(typeUrl);

    const typeEffectivenessData = await typeEffectivenessPromise.json();

    const doubleDamageArray = typeEffectivenessData.damage_relations.double_damage_to;
    const halfDamageArray = typeEffectivenessData.damage_relations.half_damage_to;
    const noDamageArray = typeEffectivenessData.damage_relations.no_damage_to;

    doubleDamageArray.forEach((type)=>{
        pokemonApp.typesEffectiveness[typeName][type.name] = "doubleDamage";
    })

    halfDamageArray.forEach((type)=>{
        pokemonApp.typesEffectiveness[typeName][type.name] = "halfDamage";
    })

    noDamageArray.forEach((type)=>{
        pokemonApp.typesEffectiveness[typeName][type.name] = "noDamage";
    })




}




pokemonApp.changeCpuPokemon = (inGame = false)=>{
    $(".cpuBattlingPokemon").remove();

    if(pokemonApp.vsPokemons.length === 0){
        // alert("The pokemon master ran out of pokemons! you win!");
        setTimeout(() => {
            $(".final_message p").text("The pokemon master ran out of pokemons! YOU WIN! You are the new Pokemon Master!");
            $(".reload").text("PLAY AGAIN");
            $(".final_message").fadeIn();
        }, 1000);
        
    }else{
        const previousPokemon = pokemonApp.cpuActivePokemonIndex;

        pokemonApp.cpuActivePokemonIndex = pokemonApp.getRandomNumber(pokemonApp.vsPokemons.length);

        if(previousPokemon === pokemonApp.cpuActivePokemonIndex){
            pokemonApp.cpuActivePokemonIndex = pokemonApp.getRandomNumber(pokemonApp.vsPokemons.length);
        }

        const cpuPokemon = pokemonApp.vsPokemons[pokemonApp.cpuActivePokemonIndex]; 

        
        // pokemonApp.makeAlert(`The pokemon master is sending ${cpuPokemon.name.toUpperCase()} out`);
        if(inGame === true){
            pokemonApp.makeAlert(`The pokemon master took ${pokemonApp.vsPokemons[previousPokemon].name.toUpperCase()} out of the battle...`);
        }

        setTimeout(() => {
            pokemonApp.cpuPokeballAnimation();
            pokemonApp.makeAlert(`The pokemon master is sending ${cpuPokemon.name.toUpperCase()} out`);

            setTimeout(() => {
                $(".computerPokemon").append(`<img class="cpuBattlingPokemon" src="${cpuPokemon.image_front}" alt"${cpuPokemon.name}">`);
                 
            }, 1500);
            
        }, 2000);

        

        const remainingHpPorcentage = Math.ceil((cpuPokemon.stats.hp/cpuPokemon.stats.fullHp)*100);

        if(remainingHpPorcentage >= 50){
            $(`.cpusPokemonInfo .healthBar`).css("background",`linear-gradient(to right, green ${remainingHpPorcentage}% ,black 0%`);
    
        }else if(remainingHpPorcentage > 25){
            $(`.cpusPokemonInfo .healthBar`).css("background",`linear-gradient(to right, orange ${remainingHpPorcentage}% ,black 0%`);
    
        }else{
            $(`.cpusPokemonInfo .healthBar`).css("background",`linear-gradient(to right, red ${remainingHpPorcentage}% ,black 0%`);
    
        }

        

        $(".computerPokemon .name").text(cpuPokemon.name.toUpperCase());

        setTimeout(() => {
            $(".moveButton").removeAttr("disabled"); 
            $(".change").removeAttr("disabled");
        }, 3000);

       
    }

    
}

pokemonApp.playerPokeballAnimation = () => {
    $(".playersPokemon").append(`<img class="playerPokeballAnimation"src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png">`);

    setTimeout(() => {
        $(".activePokemon").addClass("lightning");
        setTimeout(() => {
            $(".lightning").removeClass("lightning");
        }, 1500);
    }, 1000);

    setTimeout(() => {
        $(".playerPokeballAnimation").remove();
    }, 1000);

    

}

pokemonApp.checkUndefined = () => {
    pokemonApp.vsPokemons.forEach((pokemon)=>{
        if(pokemon.name === undefined){
            return true;
        }
    });
    pokemonApp.playerPokemons.forEach((pokemon)=>{
        if(pokemon.name === undefined){
            return true;
        }
    })
}

pokemonApp.cpuPokeballAnimation = () => {
    $(".computerPokemon").append(`<img class="cpuPokeballAnimation" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png">`);

    setTimeout(() => {
        $(".activePokemon").addClass("lightning");
        setTimeout(() => {
            $(".lightning").removeClass("lightning");
        }, 1500);
    }, 1000);

    setTimeout(() => {
        $(".cpuPokeballAnimation").remove();
    }, 1000);
}

$(function(){
    pokemonApp.init();
})

    

  