import {parseAndGetProgram, parseAndGetStatement} from '../../../utils';
import {expect} from 'chai';
import {Fragment, Token} from '../../../../src/index';

describe('Program', () => {
    it('should return correct type', () => {
        expect(parseAndGetProgram(';').type).to.equal('Program');
    });

    it('should accept empty string', () => {
        var program = parseAndGetProgram('');
        expect(program.type).to.equal('Program');
        expect(program.body.length).to.equal(0);
    });

    it('should accept no statements', () => {
        var program = parseAndGetProgram(' /* */ ');
        expect(program.type).to.equal('Program');
        expect(program.body.length).to.equal(0);
    });

    it('should accept single statement', () => {
        var program = parseAndGetProgram(';');
        expect(program.body[0].type).to.equal('EmptyStatement');
    });

    it('should accept multiple statements', () => {
        var program = parseAndGetProgram(' ; ; ; /* */ // cmt');
        expect(program.body[0].type).to.equal('EmptyStatement');
        expect(program.body[1].type).to.equal('EmptyStatement');
        expect(program.body[2].type).to.equal('EmptyStatement');
        expect(program.childElements.length).to.equal(10);
        expect(program.childElements.map(el => el.sourceCode)).to.deep.equal([
            ' ', ';', ' ', ';', ' ', ';', ' ', '/* */', ' ', '// cmt'
        ]);
        expect(program.childElements.map(el => el.type)).to.deep.equal([
            'Whitespace',
            'EmptyStatement',
            'Whitespace',
            'EmptyStatement',
            'Whitespace',
            'EmptyStatement',
            'Whitespace',
            'BlockComment',
            'Whitespace',
            'LineComment'
        ]);
    });

    describe('selectNodesByType()', () => {
        it('should return node list', () => {
            let program = parseAndGetProgram('if (x) { y++; z--; } if (w) { i--; }');
            expect(program.selectNodesByType('Identifier').map(n => n.name))
                .to.have.members(['x', 'y', 'z', 'w', 'i']);
        });

        it('should track removes', () => {
            let program = parseAndGetProgram('if (x) { y++; z--; } if (w) { i--; }');
            expect(program.selectNodesByType('Identifier').map(n => n.name))
                .to.have.members(['x', 'y', 'z', 'w', 'i']);

            let firstExpressionStatement = program.selectNodesByType('ExpressionStatement')[0];
            firstExpressionStatement.parentElement.removeChild(firstExpressionStatement);
            expect(program.sourceCode).to.equal('if (x) {  z--; } if (w) { i--; }');
            expect(program.selectNodesByType('Identifier').map(n => n.name))
                .to.have.members(['x', 'z', 'w', 'i']);

            let firstIfStatement = program.selectNodesByType('IfStatement')[0];
            firstIfStatement.parentElement.removeChild(firstIfStatement);
            expect(program.sourceCode).to.equal(' if (w) { i--; }');
            expect(program.selectNodesByType('Identifier').map(n => n.name))
                .to.have.members(['w', 'i']);
        });

        it('should track additions', () => {
            let program = parseAndGetProgram('if (x) { y++; z--; } if (w) { i--; }');
            expect(program.selectNodesByType('Identifier').map(n => n.name))
                .to.have.members(['x', 'y', 'z', 'w', 'i']);

            let expressionStatement = parseAndGetStatement('j++;').cloneElement();

            let firstExpressionStatement = program.selectNodesByType('ExpressionStatement')[0];
            firstExpressionStatement.parentElement.insertChildBefore(
                new Fragment([expressionStatement, new Token('Whitespace', ' ')]),
                firstExpressionStatement
            );

            expect(program.sourceCode).to.equal('if (x) { j++; y++; z--; } if (w) { i--; }');

            expect(program.selectNodesByType('Identifier').map(n => n.name))
                .to.have.members(['x', 'y', 'z', 'w', 'i', 'j']);
        });
    });

    describe('selectTokensByType()', () => {
        it('should return token list', () => {
            let program = parseAndGetProgram('if (x) { y++; z--; } if (w) { i--; }');
            expect(program.selectTokensByType('Identifier').map(n => n.value))
                .to.have.members(['x', 'y', 'z', 'w', 'i']);
        });

        it('should track removes', () => {
            let program = parseAndGetProgram('if (x) { y++; z--; } if (w) { i--; }');
            expect(program.selectTokensByType('Identifier').map(n => n.value))
                .to.have.members(['x', 'y', 'z', 'w', 'i']);

            let firstExpressionStatement = program.selectNodesByType('ExpressionStatement')[0];
            firstExpressionStatement.parentElement.removeChild(firstExpressionStatement);
            expect(program.sourceCode).to.equal('if (x) {  z--; } if (w) { i--; }');
            expect(program.selectTokensByType('Identifier').map(n => n.value))
                .to.have.members(['x', 'z', 'w', 'i']);

            let firstIfStatement = program.selectNodesByType('IfStatement')[0];
            firstIfStatement.parentElement.removeChild(firstIfStatement);
            expect(program.sourceCode).to.equal(' if (w) { i--; }');
            expect(program.selectTokensByType('Identifier').map(n => n.value))
                .to.have.members(['w', 'i']);
        });

        it('should track additions', () => {
            let program = parseAndGetProgram('if (x) { y++; z--; } if (w) { i--; }');
            expect(program.selectTokensByType('Identifier').map(n => n.value))
                .to.have.members(['x', 'y', 'z', 'w', 'i']);

            let expressionStatement = parseAndGetStatement('j++;').cloneElement();

            let firstExpressionStatement = program.selectNodesByType('ExpressionStatement')[0];
            firstExpressionStatement.parentElement.insertChildBefore(
                new Fragment([expressionStatement, new Token('Whitespace', ' ')]),
                firstExpressionStatement
            );

            expect(program.sourceCode).to.equal('if (x) { j++; y++; z--; } if (w) { i--; }');

            expect(program.selectTokensByType('Identifier').map(n => n.value))
                .to.have.members(['x', 'y', 'z', 'w', 'i', 'j']);
        });
    });
});
