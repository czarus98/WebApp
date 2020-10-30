let app = angular.module('WebApp', [])

app.controller('Ctrl', [ '$interval', function($interval) {
    console.log('Kontroler Ctrl startuje')
    let ctrl = this

    this.person={
        firstName: 'Jan',
        lastName: 'Kowalski',
        year: 1990
    }

    $interval(function (){
        ctrl.person.year--
    }, 1000)
}])