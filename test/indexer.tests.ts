/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { should } from 'chai';
import { tokenize, Input, Token } from './utils/tokenize';

describe("Grammar", () => {
    before(() => { should(); });

    describe("Indexers", () => {
        it("declaration", async () => {

            const input = Input.InClass(`
public string this[int index]
{
    get { return index.ToString(); }
}`);

            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keywords.Modifiers.Public,
                Token.PrimitiveType.String,
                Token.Keywords.This,
                Token.Punctuation.OpenBracket,
                Token.PrimitiveType.Int,
                Token.Identifiers.ParameterName("index"),
                Token.Punctuation.CloseBracket,
                Token.Punctuation.OpenBrace,
                Token.Keywords.Get,
                Token.Punctuation.OpenBrace,
                Token.Keywords.Control.Return,
                Token.Variables.Object("index"),
                Token.Punctuation.Accessor,
                Token.Identifiers.MethodName("ToString"),
                Token.Punctuation.OpenParen,
                Token.Punctuation.CloseParen,
                Token.Punctuation.Semicolon,
                Token.Punctuation.CloseBrace,
                Token.Punctuation.CloseBrace]);
        });

        it("explicitly-implemented interface member", async () => {

            const input = Input.InClass(`string IFoo<string>.this[int index];`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.String,
                Token.Type("IFoo"),
                Token.Punctuation.TypeParameters.Begin,
                Token.PrimitiveType.String,
                Token.Punctuation.TypeParameters.End,
                Token.Punctuation.Accessor,
                Token.Keywords.This,
                Token.Punctuation.OpenBracket,
                Token.PrimitiveType.Int,
                Token.Identifiers.ParameterName("index"),
                Token.Punctuation.CloseBracket,
                Token.Punctuation.Semicolon]);
        });

        it("declaration in interface", async () => {

            const input = Input.InInterface(`string this[int index] { get; set; }`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.String,
                Token.Keywords.This,
                Token.Punctuation.OpenBracket,
                Token.PrimitiveType.Int,
                Token.Identifiers.ParameterName("index"),
                Token.Punctuation.CloseBracket,
                Token.Punctuation.OpenBrace,
                Token.Keywords.Get,
                Token.Punctuation.Semicolon,
                Token.Keywords.Set,
                Token.Punctuation.Semicolon,
                Token.Punctuation.CloseBrace]);
        });

        it("declaration in interface (read-only)", async () => {

            const input = Input.InInterface(`string this[int index] { get; }`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.String,
                Token.Keywords.This,
                Token.Punctuation.OpenBracket,
                Token.PrimitiveType.Int,
                Token.Identifiers.ParameterName("index"),
                Token.Punctuation.CloseBracket,
                Token.Punctuation.OpenBrace,
                Token.Keywords.Get,
                Token.Punctuation.Semicolon,
                Token.Punctuation.CloseBrace]);
        });

        it("declaration in interface (write-only)", async () => {

            const input = Input.InInterface(`string this[int index] { set; }`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.String,
                Token.Keywords.This,
                Token.Punctuation.OpenBracket,
                Token.PrimitiveType.Int,
                Token.Identifiers.ParameterName("index"),
                Token.Punctuation.CloseBracket,
                Token.Punctuation.OpenBrace,
                Token.Keywords.Set,
                Token.Punctuation.Semicolon,
                Token.Punctuation.CloseBrace]);
        });

        it("parameters with default values (issue #30)", async () => {
            const input = Input.InClass(`
int this[string p = null] { }
`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.Int,
                Token.Keywords.This,
                Token.Punctuation.OpenBracket,
                Token.PrimitiveType.String,
                Token.Identifiers.ParameterName("p"),
                Token.Operators.Assignment,
                Token.Literals.Null,
                Token.Punctuation.CloseBracket,
                Token.Punctuation.OpenBrace,
                Token.Punctuation.CloseBrace
            ]);
        });

        it("ref return", async () => {
            const input = Input.InInterface(`ref int this[int index] { get; }`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keywords.Modifiers.Ref,
                Token.PrimitiveType.Int,
                Token.Keywords.This,
                Token.Punctuation.OpenBracket,
                Token.PrimitiveType.Int,
                Token.Identifiers.ParameterName("index"),
                Token.Punctuation.CloseBracket,
                Token.Punctuation.OpenBrace,
                Token.Keywords.Get,
                Token.Punctuation.Semicolon,
                Token.Punctuation.CloseBrace]);
        });

        it("ref readonly return", async () => {
            const input = Input.InInterface(`ref readonly int this[int index] { get; }`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keywords.Modifiers.Ref,
                Token.Keywords.Modifiers.ReadOnly,
                Token.PrimitiveType.Int,
                Token.Keywords.This,
                Token.Punctuation.OpenBracket,
                Token.PrimitiveType.Int,
                Token.Identifiers.ParameterName("index"),
                Token.Punctuation.CloseBracket,
                Token.Punctuation.OpenBrace,
                Token.Keywords.Get,
                Token.Punctuation.Semicolon,
                Token.Punctuation.CloseBrace]);
        });

        it("closing bracket of parameter list on next line", async () => {
            const input = Input.InClass(`
string this[
    int index
    ]
{
}`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.String,
                Token.Keywords.This,
                Token.Punctuation.OpenBracket,

                Token.PrimitiveType.Int,
                Token.Identifiers.ParameterName("index"),

                Token.Punctuation.CloseBracket,
                Token.Punctuation.OpenBrace,
                Token.Punctuation.CloseBrace
            ]);
        });

        it("closing bracket of parameter list on next line with attribute", async () => {
            const input = Input.InClass(`
string this[
    [In] int index
    ]
{
}`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.String,
                Token.Keywords.This,
                Token.Punctuation.OpenBracket,

                Token.Punctuation.OpenBracket,
                Token.Type("In"),
                Token.Punctuation.CloseBracket,

                Token.PrimitiveType.Int,
                Token.Identifiers.ParameterName("index"),

                Token.Punctuation.CloseBracket,
                Token.Punctuation.OpenBrace,
                Token.Punctuation.CloseBrace
            ]);
        });
    });
});